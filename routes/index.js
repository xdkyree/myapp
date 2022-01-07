var express = require('express');
var router = express.Router();


router.get("/play", function(req, res) {
  res.sendFile("game.html", {root: "./public"});
})




/* GET home page. */
router.get("/", function(req, res,) {
  console.log("eo");
  res.sendFile("splash.html", {root: "./public"});
});

module.exports = router;
