/* eslint-disable no-undef */
//@ts-check


const cards = document.querySelectorAll(".card");
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
    if(this.revealedCards.length === 2) {
        var idA = this.revealedCards[0].id;
        var idB = this.revealedCards[1].id;
        if(idA.charAt(0) === idB.charAt(0)){
            this.aScore++;
            var parentThis = this;
            this.revealedCards.forEach( function(el) {
                parentThis.usedCards.push(el);
                for(var i = 0; i < parentThis.availableCards.length; i++) {
                    if(parentThis.availableCards[i].id === el.id) {
                        parentThis.availableCards.splice(i, 1);
                    }
                }
            })
            this.revealedCards.forEach( function(element) {
                var elClone = element.cloneNode(true);
                element.parentNode.replaceChild(elClone, element)
                elClone.setAttribute("src", "images/cat.png");
            });
            this.revealedCards = new Array();
            var score = document.getElementById("aScore");
            score.textContent = 'Blue score: ' + this.aScore;
            if(this.availableCards.length === 0) {
                setTimeout(function() {
                    alert("You won!");
                }, 500)
                this.availableCards = Array.from(this.usedCards);
                var x = concealCardNoEvent(parentThis);
                setTimeout( function() {
                    parentThis.availableCards.forEach(function(el) {
                        console.log(el);
                        x(el);
                    })
                }, 600);
            }

        } else {
            var parentThis = this
            setTimeout(function() {
                var x = concealCardNoEvent(parentThis);
                x(parentThis.revealedCards[0]);
                x(parentThis.revealedCards[0]);
            }, 1000)
        }
    }
}


function concealCardNoEvent(gameState) {
    return function conceal(ca) {
        var card = ca;
        card.setAttribute("src", "images/logo.png");
        card.addEventListener("click", revealCard(gameState));
        card.removeEventListener("click", conceal, false);
        for( var i = 0; i < gameState.revealedCards.length; i++) {
            if(gameState.revealedCards[i].id === card.id) {
                gameState.revealedCards.splice(i, 1);
            }
        }
    }
    
}

function concealCard(gameState) {
    return function conceal(ca) {
        var card;
        if(!(typeof ca.altKey == "undefined")) {
            card = document.getElementById(ca.target["id"]);
        } else {
            card = ca;
        }
        
        card.setAttribute("src", "images/logo.png");
        card.addEventListener("click", revealCard(gameState));
        card.removeEventListener("click", conceal, false);
        for( var i = 0; i < gameState.revealedCards.length; i++) {
            if(gameState.revealedCards[i].id === card.id) {
                gameState.revealedCards.splice(i, 1);
            }
        }
    }
    
}

function revealCard(gameState) {
    return function reveal(ca) {
        const card = document.getElementById(ca.target["id"]);
        card.setAttribute("src", "images/" + ca.target["id"].charAt(0) + ".png");
        card.addEventListener("click", concealCard(gameState));
        card.removeEventListener("click", reveal, false);
        gameState.revealedCards.push(card);
        gameState.playRound("A");
    }
    
};

function initializeCards(gameState) {
        gameState.availableCards.forEach( function (element) {
            element.setAttribute("src", "images/logo.png");
            element.addEventListener("click", revealCard(gameState));
        });
    }
let gs = new GameState(cards)
initializeCards(gs);









