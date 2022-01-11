//@ts-check
/* eslint-disable no-undef */


function GameState(sb, socket) {
    this.playerType = null;
    this.score = 0;
    this.enemyScore = 0;
    this.revealedCards = [];
    this.usedCards = [];
    this.cards = document.querySelectorAll(".card");
    this.availableCards = Array.from(this.cards);
    this.statusBar = sb;
    this.socket = socket;
    this.enemyCards = [];
    this.revealBind = this.reveal.bind(this);
    this.concealBind = this.conceal.bind(this);
}

GameState.prototype.getPlayerType = function() {
    return this.playerType;
} 

GameState.prototype.setPlayerType = function(p) {
    this.playerType = p;
}

GameState.prototype.setRevealedCards = function(p) {
    this.revealedCards = p;
}

GameState.prototype.incEnemyScore = function() {
    this.enemyScore++;
}

GameState.prototype.whoWon = function() {
    if(this.availableCards,length === 0) {
        if(this.score > this.enemyScore) {
            return this.playerType;
        } else {
            if(this.playerType == "A") {
                return "B";
            } else {
                return "A";
            }
        }
    } else {
        return null;
    }
}

GameState.prototype.reveal = function RevealFunc(ca) {
    const card = document.getElementById(ca.target["id"]);
    card.setAttribute("src", "images/" + ca.target["id"].charAt(0) + ".png")
    card.addEventListener("click",this.concealBind, {once: true} );
    this.revealedCards.push(card);
    this.updateGame();
}

GameState.prototype.matchCards = function(ca) {
    var parentThis = this;
    ca.forEach( function(el) {
        for(var i =0; i < parentThis.availableCards.length; i++) {
            if(parentThis.availableCards[i].id === el.id) {
                parentThis.availableCards.splice(i,1);
                var newElement = el.cloneNode();
                newElement.setAttribute("src", "images/cat.png");
                el.replaceWith(newElement);
                parentThis.usedCards.push(el);
            }
        }
    })
}

GameState.prototype.conceal = function ConcealFunc(ca) {
    const card = document.getElementById(ca.target["id"]);
    card.setAttribute("src", "images/logo.png");
    card.addEventListener("click", this.revealBind, {once: true});
    for( var i = 0; i < this.revealedCards.length; i++) {
        if(this.revealedCards[i].id === card.id) {
            this.revealedCards.splice(i, 1);
        }
    }
}

GameState.prototype.revealOpponentCard = function(ca) {
    const card = document.getElementById(ca);
    ca.setAttribute("src", "images/" + ca.id.charAt(0) + ".png")
    setTimeout(function() {
        ca.setAttribute("src", "images/logo.png");
    } , 500);
}

GameState.prototype.concealWrong = function(ca) {
        ca.setAttribute("src", "images/logo.png");
        for( var i = 0; i < this.revealedCards.length; i++) {
            if(this.revealedCards[i].id === ca.id) {
                this.revealedCards.splice(i, 1);
            }
        }
        for( var i = 0; i < this.availableCards.length; i++) {
            if(this.availableCards[i].id === ca.id) {
                this.availableCards.splice(i, 1);
            }
        }
        var newElement = ca.cloneNode();
        newElement.addEventListener("click", this.reveal.bind(this),{once: true}); 
        ca.replaceWith(newElement);
        this.availableCards.push(ca);
}

GameState.prototype.initializeCards = function() {
    var parentThis = this;
    this.availableCards.forEach( function (element) {
        element.setAttribute("src", "images/logo.png");
        element.addEventListener("click", parentThis.reveal.bind(parentThis), {once: true});
    })
}

GameState.prototype.updateGame = function() {
     if(this.revealedCards.length == 2) {
        // @ts-ignore
        var outMsg = Messages.O_TARGET_CARDS;
        outMsg.data = [this.revealedCards[0].id, this.revealedCards[1].id];
        console.log(JSON.stringify(outMsg));
        this.socket.send(JSON.stringify(outMsg));
         if(this.revealedCards[0].id.charAt(0) === this.revealedCards[1].id.charAt(0)) {
             this.score++;
             // @ts-ignore
             this.socket.send(JSON.stringify(Messages.O_SCORE));
             this.matchCards(this.revealedCards);
             this.revealedCards = new Array();
             var score = document.getElementById("aScore");
             score.textContent = 'Your score: ' + this.score;
             if(this.availableCards.length === 0) {
                 setTimeout(function() {
                     alert("You won!");
                 }, 500)
                 // @ts-ignore
                 outMsg = Messages.O_GAME_WON_BY;
             }
             
         } else {
             var parentThis = this;
             setTimeout(function() {
                parentThis.concealWrong(parentThis.revealedCards[0]);
                parentThis.concealWrong(parentThis.revealedCards[0]);
                 alert("Wrong Cards!");
             }, 500)
         }
     }
}


function setup() {
    const socket = new WebSocket("ws://localhost:3000");

    var sb = null;

    const gs = new GameState(sb, socket);
    gs.initializeCards();
    socket.binaryType = "arraybuffer";
    socket.onmessage = function (event) {
        let incomingMsg;
        incomingMsg = JSON.parse(event.data);
        console.log(incomingMsg);
        
        

        // @ts-ignore
        if(incomingMsg.type == Messages.T_CHOOSE ) {
            alert("You can choose now!");
        }
        // @ts-ignore
        if(incomingMsg.type == Messages.T_PLAYER_TYPE) {
            gs.setPlayerType(incomingMsg.data);
        }
        // @ts-ignore
        if(incomingMsg.type == Messages.T_TARGET_CARDS) {
            gs.enemyCards = incomingMsg.data;
            gs.revealOpponentCard(gs.enemyCards[0]);
            gs.revealOpponentCard(gs.enemyCards[1]);
            alert("You can choose now!");
        }
        // @ts-ignore
        if(incomingMsg.type == Messages.T_SCORE) {
            gs.incEnemyScore();
            gs.matchCards(gs.enemyCards);
        }
    }

    socket.onopen = function () {
        socket.send("{}");
    }

    socket.onclose = function() {
        if(gs.whoWon() == null) {
            alert("Aborted");
        }
    }

    socket.onerror = function () {};
}

setup();