const express = require("express");
const http = require("http");


const websocket = require("ws");

const indexRouter = require("./routes/index");

if(process.argv.length < 3) {
    console.log("Error: expected a port as argument");
    process.exit(1);
}

const port = process.argv[2];
const app = express();

app.get("play", indexRouter);
app.get("/", indexRouter);


app.use(express.static(__dirname + "/public"));
http.createServer(app).listen(port);
