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

app.get("play", indexRouter);
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
}, 5000);

let currentGame = new Game(gamesInitialized++);
let connectionID = 0;

wss.on("connection", function connection(ws) {
    const con = ws;
    con["id"] = connectionID++;
    const playerType = currentGame.addPlayer(con);
    websockets[con["id"]] = currentGame;

    console.log(
        'Player ${con["id]} placed in game ${currentGame.id} as ${playerType}'
    );

    con.send(playerType == "A" ? messages.S_PLAYER_A : messages.S_PLAYER_B)

    if(currentGame.hasTwoPlayers()) {
        currentGame = new Game(gamesInitialized++);
    }

    con.on("message", function incoming(message) {
        const oMsg = JSON.parse(message.toString());

        const gameObj = websockets[con["id"]];
    })
})


app.use(express.static(__dirname + "/public"));
http.createServer(app).listen(port);
