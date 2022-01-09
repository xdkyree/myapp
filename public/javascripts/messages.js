//@ts-check

(function (exports) {

    exports.T_GAME_WON_BY = "GAME-WON-BY";
    exports.O_GAME_WON_BY = {
        type: exports.T_GAME_WON_BY,
        data: null,
    };

    exports.O_GAME_ABORTED = {
        type: "GAME-ABORTED",
      };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);

    exports.O_CHOOSE = { type: "CHOOSE-CARD" };
    exports.S_CHOOSE = JSON.stringify(exports.O_CHOOSE);

    exports.T_PLAYER_TYPE = "PLAYER-TYPE";
    exports.O_PLAYER_A = {
        type: exports.T_PLAYER_TYPE,
        data: "A",
    };
    exports.S_PLAYER_A = JSON.stringify(exports.O_PLAYER_A);


    exports.O_PLAYER_B = {
        type: exports.T_PLAYER_TYPE,
        data: "B",
    };
    exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);

    exports.T_TARGET_CARD = "SET-TARGET-CARD";
    exports.O_TARGET_CARD = {
        type: exports.T_TARGET_CARD,
        data: null,
    };

    exports.T_GAME_OVER = "GAME-OVER";
    exports.O_GAME_OVER = {
        type: exports.T_GAME_OVER,
        data: null,
    };
// @ts-ignore
})(typeof exports === "undefined" ? ( this.Messages = {}) : exports);