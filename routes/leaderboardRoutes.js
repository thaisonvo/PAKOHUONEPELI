const router = require("express").Router();
const { getLeaderboard, submitScore } = require("../controllers/leaderboardController");
const { attachActiveGamesMap } = require("../middleware/attachActiveGamesMap");

router.get("/", getLeaderboard);
router.post("/submit-score", attachActiveGamesMap, submitScore);

module.exports = router;
