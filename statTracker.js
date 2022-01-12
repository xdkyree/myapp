//@ts-check


 const gameStatus = {
    since: Date.now() ,
    gamesPlayed: 0 ,
    playersOnline: 0 ,
    aWins: 0,
    bWins: 0,
    winRatio : function() {
        return this.aWins/this.bWins;
    } 
  };

  
  module.exports = gameStatus;