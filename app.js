const express = require("express");
const http = require("http");
const websocket = require("ws");

const indexRouter = require("./routes/index");
const messages = require("./public/javascripts/messages");

const Game = require("./game");

if(process.argv.length < 3) {
    console.log("Error: expected a port as argument");
    process.exit(1);
}

const port = process.argv[2];
const app = express();



app.use(express.static(__dirname + "/public"));
app.get("/play", indexRouter);
app.get("/", indexRouter);

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

    console.log(
        `Player ${con["id"]} placed in game ${currentGame.id} as ${playerType}`
    );

    con.send(playerType == "A" ? messages.S_PLAYER_A : messages.S_PLAYER_B)
    if(playerType == "A") {
        con.send(JSON.stringify(messages.O_CHOOSE));
    }

    if(currentGame.hasTwoPlayers()) {
        currentGame = new Game(gamesInitialized++);
    }

    con.on("message", function incoming(message) {
        const oMsg = JSON.parse(message.toString());

        const gameObj = websockets[con["id"]];
        const isPlayerA = gameObj.playerA == con ? true : false;

        if(isPlayerA) {
            if(oMsg.type == messages.T_TARGET_CARDS) {
                gameObj.playerB.send(message);
            }
            if(oMsg.type == messages.T_SCORE) {
                gameObj.playerB.send(message);
            }

        } else {
            if(oMsg.type == messages.T_TARGET_CARDS) {
                gameObj.playerA.send(message);
            }
            if(oMsg.type == messages.T_SCORE) {
                gameObj.playerA.send(message);
            }
        }

        if(oMsg.type == messages.T_GAME_OVER) {
            gameObj.setStatus(oMsg.data);f
        }
    })

    con.on("close", function(code) {
        console.log(`${con["id"]} disconnected ...`);

        if(code == 1001) {
            const gameObj = websockets[con["id"]];

            if(gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
                gameObj.setStatus("ABORTED");
            }

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