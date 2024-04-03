const router = require("express").Router();
const { attachActiveGamesMap } = require("../middleware/attachActiveGamesMap");
const {
    initializePlayer,
    startGame,
    getIntroduction,
    getQuestion,
    getHint,
    getHintCount,
    checkAnswer,
    checkTime
} = require("../controllers/gameController");

router.use(attachActiveGamesMap);

router.post("/initialize", initializePlayer);
router.post("/start", startGame);
router.get("/introduction", getIntroduction);
router.get("/questions/current", getQuestion);
router.get("/hints/current", getHint);
router.get("/hints/count", getHintCount);
router.post("/questions/answer", checkAnswer);
router.get("/time", checkTime);

module.exports = router;