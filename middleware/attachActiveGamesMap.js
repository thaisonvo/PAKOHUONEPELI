const activeGames = require("../activeGamesMap");

const attachActiveGamesMap = (req, res, next) => {
    req.activeGames = activeGames;
    next();
}

module.exports = { attachActiveGamesMap };