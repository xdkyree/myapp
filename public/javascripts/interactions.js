/* eslint-disable no-undef */
//@ts-check

const cards = document.querySelectorAll(".card");
let gs = new GameState(cards)

/**
 * Game state object
 * @param {*} cards 
 */
function GameState(cards) {
    this.playerA = null;
    this.playerB = null;
    this.aScore = 0;
    this.bScore = 0;
    this.revealedCards = [];
    this.availableCards = Array.from(cards);
    this.usedCards = [];
}

GameState.prototype.playRound = function (playerId) {
    //Checks whether the number of uncovered cards is equal to 2
    // if no then does nothing
    if(this.revealedCards.length === 2) {
        // Checks if the cards are matching, if not covers them
        if(this.revealedCards[0].id.charAt(0) === this.revealedCards[1].id.charAt(0)){
            this.aScore++;
            this.matchCards();
            // Modifies the score
            this.revealedCards = new Array();
            var score = document.getElementById("aScore");
            score.textContent = 'Blue score: ' + this.aScore;
            // Checks if all the cards have been uncovered
            if(this.availableCards.length === 0) {
                // If true resets the game
                setTimeout(function() {
                    alert("You won!");
                }, 500)
                this.availableCards = Array.from(this.usedCards);
                this.usedCards = new Array();
                var parentThis = this;
                setTimeout( function() {
                    parentThis.initializeCards();
                    var score = document.getElementById("aScore");
                    score.textContent = 'Blue score: ' + parentThis.aScore;
                }, 600);
                this.aScore = 0;
            }

        } else {
            //Covers the cards and alerts the player after a small cooldown
            var parentThis = this
            setTimeout(function() {
                alert("Wrong cards!");
                parentThis.concealRevealed(parentThis.revealedCards[0]);
                parentThis.concealRevealed(parentThis.revealedCards[0]);
            }, 500)
        }
    }
}

// Removes matched cards from play
GameState.prototype.matchCards = function() {
    var parentThis = this;
    // Removes the uncovered cards from the available cards
    this.revealedCards.forEach( function(el) {
        parentThis.usedCards.push(el);
        for(var i = 0; i < parentThis.availableCards.length; i++) {
            if(parentThis.availableCards[i].id === el.id) {
                parentThis.availableCards.splice(i, 1);
            }
        }
    })
    // Removes all events from the card to make it static
    this.revealedCards.forEach( function(element) {
        var conceal = function(ca) {};
        element.removeEventListener("click", referConceal, false);
        element.setAttribute("src", "images/cat.png");
    });
}

// Conceals a revealed card object
GameState.prototype.concealRevealed = function(ca) {
    var card = ca;
    card.setAttribute("src", "images/logo.png");
    card.addEventListener("click", this.revealCard(this));
    card.removeEventListener("click", referConceal, false);
    for( var i = 0; i < this.revealedCards.length; i++) {
        if(this.revealedCards[i].id === card.id) {
            this.revealedCards.splice(i, 1);
        }
    }
}

// Conceals a card and adds an event to reveal
GameState.prototype.concealCard = function(gameState) {
    return function conceal(ca) {
        const card = document.getElementById(ca.target["id"]);
        card.setAttribute("src", "images/logo.png");
        card.addEventListener("click", gameState.revealCard(gameState));
        card.removeEventListener("click", referConceal, false);
        for( var i = 0; i < gameState.revealedCards.length; i++) {
            if(gameState.revealedCards[i].id === card.id) {
                gameState.revealedCards.splice(i, 1);
            }
        }
    }
};

// Reveals a card and add an event to conceal
GameState.prototype.revealCard = function(gameState) {
    return function reveal(ca) {
        const card = document.getElementById(ca.target["id"]);
        card.setAttribute("src", "images/" + ca.target["id"].charAt(0) + ".png")
        card.addEventListener("click", referConceal);
        card.removeEventListener("click", reveal, false);
        gameState.revealedCards.push(card);
        gameState.playRound("A");
    }
};

// Initializes the cards at the beginning and on resets
GameState.prototype.initializeCards = function() {
    var parentThis = this;
    this.availableCards.forEach( function (element) {
        element.setAttribute("src", "images/logo.png");
        element.addEventListener("click", parentThis.revealCard(parentThis));
    });
}

const referConceal = gs.concealCard(gs); // Special reference for a function
gs.initializeCards();








