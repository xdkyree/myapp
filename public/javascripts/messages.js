//@ts-check

(function (exports) {
    // S-> C Game is won
    exports.T_GAME_WON_BY = "GAME-WON-BY";
    exports.O_GAME_WON_BY = {
        type: exports.T_GAME_WON_BY,
        data: null,
    };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);
    // S -> C
    exports.T_CHOOSE = "CHOOSE";
    exports.O_CHOOSE = {
        type: exports.T_CHOOSE,
    };
    // C -> S or S -> C inform about card choice
    exports.T_TARGET_CARDS = "TARGET-CARDS";
    exports.O_TARGET_CARDS = {
        type: exports.T_TARGET_CARDS,
        data: null,
    };
    exports.T_SCORE = "SCORE";
    exports.O_SCORE = {
        type: exports.T_SCORE,
        data: null,
    }
    // S -> c
    exports.T_PLAYER_TYPE = "PLAYER-TYPE";
    exports.O_PLAYER_A = {
        type: exports.T_PLAYER_TYPE,
        data: "A",
    };
    exports.S_PLAYER_A = JSON.stringify(exports.O_PLAYER_A);
    // S -> C
    exports.O_PLAYER_B = {
        type: exports.T_PLAYER_TYPE,
        data: "B",
    };
    exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);

    exports.T_WAIT = "WAIT";
    exports.O_WAIT = {
        type: exports.T_WAIT,
    };
    // @ts-ignore
})(typeof exports === "undefined" ? (this.Messages = {}) : exports);