var express = require('express');
var router = express.Router();

const gameStatus = require("../statTracker");


router.get("/play", function(req, res) {
  res.sendFile("game.html", {root: "./public"});
})


/* GET home page. */
router.get("/", function(req, res,) {
  res.render("splash.ejs", 
  { gamesPlayed: gameStatus.gamesPlayed, 
    playersOnline: gameStatus.playersOnline, 
    aWins: gameStatus.aWins,
    bWins: gameStatus.bWins });
});

module.exports = router;
