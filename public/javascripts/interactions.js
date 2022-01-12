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
    document.getElementById("bScore").textContent = "Red player score: " + this.enemyScore;
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
    this.revealedCards.push(card);
    this.updateGame();
}

GameState.prototype.matchCards = function(ca) {
    var parentThis = this;
    ca.forEach( function(el) {
        for(var i =0; i < parentThis.availableCards.length; i++) {
            if(parentThis.availableCards[i].id === el.id) {
                parentThis.availableCards.splice(i,1);
                el.setAttribute("src", "images/cat.png");
                el.removeEventListener("click", parentThis.revealBind, false);
            }
            }
    })
}

// GameState.prototype.conceal = function ConcealFunc(ca) {
//     const card = document.getElementById(ca.target["id"]);
//     card.setAttribute("src", "images/logo.png");
//     card.addEventListener("click", this.revealBind, {once: true});
//     for( var i = 0; i < this.revealedCards.length; i++) {
//         if(this.revealedCards[i].id === card.id) {
//             this.revealedCards.splice(i, 1);
//         }
//     }
// }

GameState.prototype.revealOpponentCard = function(ca) {
    var card;
    for(var i = 0; i < this.availableCards.length; i++) {
        if(this.availableCards[i].id === ca) {
            card = this.availableCards[i];
        }
    }
    card.setAttribute("src", "images/" + ca.charAt(0) + ".png")
    var parentThis = this;
    setTimeout(function() {
        if(parentThis.availableCards.includes(card)) {
            card.setAttribute("src", "images/logo.png");
        }
    } , 2500);
}

GameState.prototype.concealWrong = function(ca) {
        ca.setAttribute("src", "images/logo.png");
        for( var i = 0; i < this.revealedCards.length; i++) {
            if(this.revealedCards[i].id === ca.id) {
                this.revealedCards.splice(i, 1);
            }
        }
        ca.addEventListener("click", this.revealBind,{once: true}); 
}

GameState.prototype.initializeCards = function() {
    var parentThis = this;
    this.availableCards.forEach( function (element) {
        element.setAttribute("src", "images/logo.png");
        element.addEventListener("click", parentThis.revealBind, {once: true});
    })
}

GameState.prototype.updateGame = function() {
     if(this.revealedCards.length == 2) {
        // @ts-ignore
        var outMsg = Messages.O_TARGET_CARDS;
        outMsg.data = [this.revealedCards[0].id, this.revealedCards[1].id];
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
                if(parentThis.availableCards.includes(parentThis.revealedCards[0])) {
                    parentThis.concealWrong(parentThis.revealedCards[0]);
                    parentThis.concealWrong(parentThis.revealedCards[0]);
                    alert("Wrong Cards!");
                }
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
        let incomingMsg = JSON.parse(event.data);
        
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
            alert("Opponnent choice!");
            gs.revealOpponentCard(gs.enemyCards[0]);
            gs.revealOpponentCard(gs.enemyCards[1]);
            setTimeout(function() {
                alert("Your choice!");
            }, 2500);
        }
        // @ts-ignore
        if(incomingMsg.type == Messages.T_SCORE) {
            gs.incEnemyScore();
            var holder = [];
            for(var i = 0; i < gs.availableCards.length; i++) {
                var card = gs.availableCards[i];
                if(card.id === gs.enemyCards[0] || card.id === gs.enemyCards[1]) {
                    holder.push(card);
                }
            }
            gs.enemyCards = holder;
            gs.matchCards(holder);
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