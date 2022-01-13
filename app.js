const express = require("express");
const http = require("http");
const websocket = require("ws");

const indexRouter = require("./routes/index");
const messages = require("./public/javascripts/messages");


const gameStatus = require("./statTracker");
const Game = require("./game");
const game = require("./game");

if(process.argv.length < 3) {
    console.log("Error: expected a port as argument");
    process.exit(1);
}

const port = process.argv[2];
const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


app.get("/play", indexRouter);
app.get("/", indexRouter);

const server = http.createServer(app);
const wss = new websocket.Server({ server });

// We want to regularly clean up the sockets
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


let currentGame = new Game(gameStatus.gamesPlayed);
let connectionID = 0;

wss.on("connection", function connection(ws) {

    // We add every two players to a single game
    const con = ws;
    con["id"] = connectionID++;
    const playerType = currentGame.addPlayer(con);
    websockets[con["id"]] = currentGame;
    gameStatus.playersOnline++;

    console.log(
        `Player ` + con["id"] + ` placed in game ` + currentGame.id
    );

    // We inform the client about his player type
    // Also we inform the first player to wait
    con.send(playerType == "A" ? messages.S_PLAYER_A : messages.S_PLAYER_B)
    if(playerType == "A") {
        con.send(JSON.stringify(messages.O_WAIT));
    } else {
        currentGame.playerA.send(JSON.stringify(messages.O_CHOOSE));
    }

    // If we have two players we create a new game for the incoming players
    if(currentGame.hasTwoPlayers()) {
        console.log("[STATUS] Game number " + gameStatus.gamesPlayed + " has started");
        currentGame = new Game(++gameStatus.gamesPlayed);
    }

    con.on("message", function incoming(message) {

        // When a message comes in we parse it, check what it is, and act upon it
        const oMsg = JSON.parse(message);
        const gameObj = websockets[con["id"]];
        const type = gameObj.playerA == con ? "A" : "B";
        gameObj.giveResponse(type, oMsg);
    })

    con.on("close", function(code) {
        console.log(`Player ${con["id"]} disconnected ...`);

        if(code == 1001) {
            const gameObj = websockets[con["id"]];

            if(gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
                gameObj.setStatus("ABORTED");
            }
            // Whenever a connection closes we decrement the number of players
            gameStatus.playersOnline--;


            // We check which player disconnected
            try {
                gameObj.playerA.send(JSON.stringify(messages.T_GAME_ABORTED))
                gameObj.playerA.close();
                gameObj.playerA = null;
              } catch (e) {
                console.log("Player A closing: " + e);
              }
      
              try {
                gameObj.playerB.send(JSON.stringify(messages.T_GAME_ABORTED))
                gameObj.playerB.close();
                gameObj.playerB = null;
              } catch (e) {
                console.log("Player B closing: " + e);
              }
        }
    })
})
// We listen on the specified port
server.listen(port);