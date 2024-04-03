const { readFileJSON, writeFileJSON } = require("../utilities/fileOperations");
const path = require("path");

const getLeaderboard = async (req, res) => {
    try {
        const escapeRoom = req.query.escapeRoom;
        if (!escapeRoom) {
            return res.sendStatus(404);
        }

        const allLeaderboards = await readFileJSON(path.join(__dirname, "..", "leaderboard.json"));
        const leaderboard = allLeaderboards[escapeRoom];
        const topTen = leaderboard.slice(0, 10);
        return res.json(topTen);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

const submitScore = async (req, res) => {
    try {
        const game = req.activeGames.get(req.session.id);
        const allLeaderboards = await readFileJSON(path.join(__dirname, "..", "leaderboard.json"));
        const leaderboard = allLeaderboards[game.escapeRoom.title];
        leaderboard.push({ 
            playerName: game.player,
            time: game.endTime,
            ms: game.endTimeMs
         });
        leaderboard.sort((a, b) => a.ms - b.ms);
        await writeFileJSON(path.join(__dirname, "..", "leaderboard.json"), allLeaderboards);
        return res.json({ rank: leaderboard.findIndex(entry => entry.playerName === game.player && entry.ms === game.endTimeMs) + 1 });
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
}

module.exports = { getLeaderboard, submitScore };