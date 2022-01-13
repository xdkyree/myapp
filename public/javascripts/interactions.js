//@ts-check
/* eslint-disable no-undef */

/**
 * GameState
 * @param {*} socket 
 */
function GameState(socket) {
    this.playerType = null;
    this.score = 0;
    this.enemyScore = 0;
    this.revealedCards = [];
    this.cards = document.querySelectorAll(".card");
    this.availableCards = Array.from(this.cards);
    this.socket = socket;
    this.enemyCards = [];
    this.revealBind = this.reveal.bind(this);
}

/**
 * Sets the player type of client
 * @param {string} p 
 */
GameState.prototype.setPlayerType = function (p) {
    this.playerType = p;
}

/**
 * Increases enemy score
 */
GameState.prototype.incEnemyScore = function () {
    this.enemyScore++;
    document.getElementById("bScore").textContent = "Opponent score: " + this.enemyScore;
}

/**
 * Reveals a card when add as an EventListener
 * @param {event} ca 
 */
GameState.prototype.reveal = function RevealFunc(ca) {
    const card = document.getElementById(ca.target["id"]);
    card.setAttribute("src", "images/" + ca.target["id"].charAt(0) + ".png")
    this.revealedCards.push(card);
    this.updateGame();
}

/**
 * Removes the cards given in an Array from the game
 * @param {Array} ca an array of cards
 */
GameState.prototype.matchCards = function (ca) {
    var parentThis = this;
    ca.forEach(function (el) {
        for (var i = 0; i < parentThis.availableCards.length; i++) {
            if (parentThis.availableCards[i].id === el.id) {
                parentThis.availableCards.splice(i, 1);
                el.setAttribute("src", "images/cat.png");
                el.removeEventListener("click", parentThis.revealBind, false);
            }
        }
    })
}

/**
 * Takes an enemy Id and reveals that card for a while
 * @param {string} ca 
 */
GameState.prototype.revealOpponentCard = function (ca) {
    var card;
    for (var i = 0; i < this.availableCards.length; i++) {
        if (this.availableCards[i].id === ca) {
            card = this.availableCards[i];
        }
    }
    card.setAttribute("src", "images/" + ca.charAt(0) + ".png")
    var parentThis = this;
    setTimeout(function () {
        if (parentThis.availableCards.includes(card)) {
            card.setAttribute("src", "images/logo.png");
        }
    }, 2500);
}
/**
 * Conceals the wrong card
 * @param {any} ca 
 */
GameState.prototype.concealWrong = function (ca) {
    ca.setAttribute("src", "images/logo.png");
    for (var i = 0; i < this.revealedCards.length; i++) {
        if (this.revealedCards[i].id === ca.id) {
            this.revealedCards.splice(i, 1);
        }
    }
}

/**
 * Makes the cards clickable
 */
GameState.prototype.initializeCards = function () {
    var parentThis = this;
    this.availableCards.forEach(function (element) {
        element.addEventListener("click", parentThis.revealBind, { once: true });
    })
}

/**
 * Stops the cards from being clicked
 */
GameState.prototype.deactivateCards = function () {
    var parentThis = this;
    this.availableCards.forEach(function (element) {
        element.removeEventListener("click", parentThis.revealBind, false);
    })
}

GameState.prototype.randomizeBoard = function() {
    var cardStore = Array.from(this.cards);
    var parent = cardStore[0].parentNode;
    cardStore.forEach( function(el) {
        el.parentNode.removeChild(el);
    })
    var limit = cardStore.length;
    for(var i = 0; i < limit; i++) {
        var chosen = Math.floor(Math.random() * cardStore.length);
        parent.appendChild(cardStore[chosen]);
        cardStore.splice(chosen, 1);
    }
}

/**
 * Updates the game
 */
GameState.prototype.updateGame = function () {
    // Checks if two cards are uncovered
    if (this.revealedCards.length == 2) {
        // Deactivates other cards and sends the info to the server
        this.deactivateCards();
        // @ts-ignore
        var outMsg = Messages.O_TARGET_CARDS;
        outMsg.data = [this.revealedCards[0].id, this.revealedCards[1].id];
        this.socket.send(JSON.stringify(outMsg));
        // Checks if cards match
        if (this.revealedCards[0].id.charAt(0) === this.revealedCards[1].id.charAt(0)) {
            // If they do update the score and send the info to the server
            this.score++;
            // @ts-ignore
            this.socket.send(JSON.stringify(Messages.O_SCORE));
            this.matchCards(this.revealedCards);
            this.revealedCards = new Array();
            var score = document.getElementById("aScore");
            score.textContent = 'Your score: ' + this.score;
            // Checks if game is over
            if (this.availableCards.length === 0) {
                // If it is check who won and end the game
                setTimeout(function () {
                    alert("You won!");
                }, 500)
                // @ts-ignore
                outMsg = Messages.O_GAME_WON_BY;
                if (this.score > this.enemyScore) {
                    outMsg.data = this.playerType;
                    alert("You won!");
                } else {
                    if (this.playerType === "A") {
                        outMsg.data = "B";
                    } else {
                        outMsg.data = "A";
                    }
                    alert("You lost!");
                }
                this.socket.send(JSON.stringify(outMsg));
            }

        } else {
            // If wrong cards hide them
            var parentThis = this;
            setTimeout(function () {
                if (parentThis.availableCards.includes(parentThis.revealedCards[0])) {
                    parentThis.concealWrong(parentThis.revealedCards[0]);
                    parentThis.concealWrong(parentThis.revealedCards[0]);
                    alert("Wrong Cards!");
                }
            }, 500)
        }
    }
}


function setup() {
    // @ts-ignore
    const socket = new WebSocket("ws://localhost:3000");

    const gs = new GameState(socket);
    socket.binaryType = "arraybuffer";
    socket.onmessage = function (event) {
        let incomingMsg = JSON.parse(event.data);

        // @ts-ignore
        if (incomingMsg.type == Messages.T_WAIT) {
            alert("Please wait for opponent!");
        }


        // @ts-ignore
        if (incomingMsg.type == Messages.T_CHOOSE) {
            gs.initializeCards();
            setTimeout(function () {
                alert("You can play now!");
            }, 250);
        }
        // @ts-ignore
        if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
            gs.setPlayerType(incomingMsg.data);
        }
        // @ts-ignore
        if (incomingMsg.type == Messages.T_TARGET_CARDS) {
            gs.enemyCards = new Array();
            gs.enemyCards = incomingMsg.data;
            alert("Opponnent choice!");
            console.log(gs.enemyCards);
            gs.revealOpponentCard(gs.enemyCards[0]);
            gs.revealOpponentCard(gs.enemyCards[1]);
            setTimeout(function () {
                alert("Your choice!");
                gs.initializeCards();
            }, 2500);
        }
        // @ts-ignore
        if (incomingMsg.type == Messages.T_SCORE) {
            gs.incEnemyScore();
            var holder = [];
            for (var i = 0; i < gs.availableCards.length; i++) {
                var card = gs.availableCards[i];
                if (card.id === gs.enemyCards[0] || card.id === gs.enemyCards[1]) {
                    holder.push(card);
                }
            }
            gs.enemyCards = holder;
            gs.matchCards(holder);
        }

        // @ts-ignore
        if (incomingMsg.type == Messages.T_GAME_WON_BY) {
            if (incomingMsg.data === gs.playerType) {
                alert("You Won!");
            } else {
                alert("You lost!");
            }
        }

        // @ts-ignore
        if (incomingMsg.type == Messages.T_GAME_ABORTED) {
            alert("Opponent left. You win!");
        }
    }

    socket.onopen = function () {
        socket.send("{}");
        gs.randomizeBoard();
    }

    socket.onerror = function () { };
}

setup();