const router = require('express').Router();
const fs = require('fs').promises;
const path = require('path');

router.get('/escapeRooms', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '..', 'allEscapeRooms.json'), 'utf8');
        const rooms = JSON.parse(data);

        res.json(rooms.map(room => room.title));
    } catch (err) {
        res.sendStatus(500);
    }
});

router.get('/leaderboard', async (req, res) => {
    try {
        const escapeRoom = req.query.escapeRoom;
        if (!escapeRoom) {
            return res.sendStatus(404);
        } 
        const data = await fs.readFile(path.join(__dirname, '..', 'leaderboard.json'), 'utf8');
        const leaderboardData = JSON.parse(data)[escapeRoom];
        const top10Players = leaderboardData.slice(0, 10);
        res.json(top10Players);
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;