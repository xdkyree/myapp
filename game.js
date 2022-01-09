//@ts-check

const websocket = require("ws");


const game = function(gameID) {
    this.playerA = null;
    this.playerB = null;
    this.id = gameID;
    this.aScore = 0;
    this.bScore = 0;
    this.availableCards = null;
    this.usedCards = [];
    this.revealedCards = [];
    this.gameState = "0 JOINT";
};

game.prototype.transitionStates = {
    "0 JOINT": 0,
    "1 JOINT": 1,
    "2 JOINT": 2,
    "A GUESS": 3,
    "B GUESS": 4,
    "A": 5,
    "B": 6,
    "ABORT": 7
};

game.prototype.transitionMatrix = [
    [0,1,0,0,0,0,0,0], // 0 JOINT
    [1,0,1,0,0,0,0,0], // 1 JOINT
    [0,0,0,1,0,0,0,1], // 2 JOINT
    [0,0,0,1,1,1,1,1], // A GUESS
    [0,0,0,1,1,1,1,1], // B GUESS
    [0,0,0,0,0,0,0,0], // A WON
    [0,0,0,0,0,0,0,0], // B WON
    [0,0,0,0,0,0,0,0]  // ABORT
];

game.prototype.isValidTransition = function(from, to) {
    let i, j;
    if(!(from in game.prototype.transitionStates)) {
        return false;
    } else {
        i = game.prototype.transitionStates[from]
    }

    if(!(to in game.prototype.transitionStates)) {
        return false;
    } else {
        j = game.prototype.transitionStates[to];
    }

    return game.prototype.transitionMatrix[i][j] > 0;
};

game.prototype.isValidState = function(s) {
    return s in game.prototype.transitionStates;
};

game.prototype.setStatus = function(w) {
    if(
        game.prototype.isValidState(w) &&
        game.prototype.isValidTransition(this.gameState, w)
    ) {
        this.gameState = w;
        console.log( "[STATUS] %s", this.gameState);
    } else {
        return new Error(
            'Impossible status change from ${this.gameState} to ${w}'
        );
    }
}

game.prototype.setCards = function(w) {
    if (this.gameState != "1 JOINT" && this.gameState != "JOINT") {
        return new Error(
            'Trying to set cards, but game status is wrong'
        );
    } 
    this.availableCards = w;
}

game.prototype.getAvailableCards = function() {
    return this.availableCards;
}

game.prototype.hasTwoPlayers = function() {
    return this.gameState == "2 JOINT";
};

game.prototype.addPlayer = function(p) {
    if (this.gameState != "0 JOINT" && this.gameState != "1 JOINT") {
        return new Error(
            'Invalid call to addPlayer, current state is ${this.gameState}'
        );
    }

    const error = this.setStatus("1 JOINT");
    if( error instanceof Error) {
        this.setStatus("2 JOINT");
    }

    if (this.playerA == null) {
        this.playerA = p;
        return "A";
    } else {
        this.playerB = p;
        return "B";
    }
};

module.exports = game;