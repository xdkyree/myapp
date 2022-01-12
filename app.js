const express = require("express");
const http = require("http");
const websocket = require("ws");

// const indexRouter = require("./routes/index");
const messages = require("./public/javascripts/messages");


const gameStatus = require("./statTracker");
const Game = require("./game");

if(process.argv.length < 3) {
    console.log("Error: expected a port as argument");
    process.exit(1);
}

const port = process.argv[2];
const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


//app.get("/play", indexRouter);
app.get("/", (req, res) => {
    res.render("splash.ejs", 
    { gamesPlayed: gameStatus.gamesPlayed, 
      playersOnline: gameStatus.playersOnline, 
      winRatio: gameStatus.winRatio });
});

const server = http.createServer(app);
const wss = new websocket.Server({ server });


const websockets = {};
let gamesInitialized = 0;
setInterval(function() {
    for (let i in websockets) {
        if(Object.prototype.hasOwnProperty.call(websockets, i)) {
            let gameObj = websockets[i];
            if(gameObj.finalStatus != null) {
                delete websockets[i];
            }
        }
    }
}, 50000);


let currentGame = new Game(gamesInitialized++);
let connectionID = 0;

wss.on("connection", function connection(ws) {
    const con = ws;
    con["id"] = connectionID++;
    const playerType = currentGame.addPlayer(con);
    websockets[con["id"]] = currentGame;
    gameStatus.playersOnline++;

    console.log(
        `Player ` + con["id"] + ` placed in game ` + currentGame.id
    );

    con.send(playerType == "A" ? messages.S_PLAYER_A : messages.S_PLAYER_B)
    if(playerType == "A") {
        con.send(JSON.stringify(messages.O_CHOOSE));
    }

    if(currentGame.hasTwoPlayers()) {
        currentGame = new Game(gamesInitialized++);
    }

    con.on("message", function incoming(message) {
        const oMsg = JSON.parse(message);

        const gameObj = websockets[con["id"]];
        const isPlayerA = gameObj.playerA == con ? true : false;

        if(isPlayerA) {
            if(oMsg.type == messages.T_TARGET_CARDS) {
                var msg = messages.O_TARGET_CARDS;
                msg.data = oMsg.data;
                gameObj.playerB.send(JSON.stringify(msg));
            }
            if(oMsg.type == messages.T_SCORE) {
                var msg = messages.O_SCORE;
                gameObj.playerB.send(JSON.stringify(msg));
            }
            if(oMsg.type == messages.T_GAME_WON_BY) {
                var msg = messages.O_GAME_WON_BY;
                msg.data = oMsg.data;
                gameObj.playerB.send(JSON.stringify(msg));
                if(msg.data === "A") {
                    gameStatus.aWins++;
                } else {
                    gameStatus.bWins++;
                }
            }

        } else {
            if(oMsg.type == messages.T_TARGET_CARDS) {
                var msg = messages.O_TARGET_CARDS;
                msg.data = oMsg.data;
                gameObj.playerA.send(JSON.stringify(msg));
            }
            if(oMsg.type == messages.T_SCORE) {
                var msg = messages.O_SCORE;
                gameObj.playerA.send(JSON.stringify(msg));
            }
            if(oMsg.type == messages.T_GAME_WON_BY) {
                var msg = messages.O_GAME_WON_BY;
                msg.data = oMsg.data;
                gameObj.playerA.send(JSON.stringify(msg));
                if(msg.data === "A") {
                    gameStatus.aWins++;
                } else {
                    gameStatus.bWins++;
                }
            }
        }
    })

    con.on("close", function(code) {
        console.log(`${con["id"]} disconnected ...`);

        if(code == 1001) {
            const gameObj = websockets[con["id"]];

            if(gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
                gameObj.setStatus("ABORTED");
            }
            gameStatus.playersOnline--;

            try {
                gameObj.playerA.close();
                gameObj.playerA = null;
              } catch (e) {
                console.log("Player A closing: " + e);
              }
      
              try {
                gameObj.playerB.close();
                gameObj.playerB = null;
              } catch (e) {
                console.log("Player B closing: " + e);
              }
        }
    })
})

server.listen(port);