const Game = require("../models/Game");
const { readFileJSON } = require("../utilities/fileOperations");
const path = require("path");

const initializePlayer = async (req, res) => {
    try {
        const { escapeRoom, playerName } = req.body;
        const activeGames = req.activeGames;

        const allEscapeRooms = await readFileJSON(path.join(__dirname, "..", "allEscapeRooms.json"));
        const roomData = allEscapeRooms.find(room => room.title === escapeRoom);

        const newGame = new Game(roomData, playerName);
        activeGames.set(req.session.id, newGame);
        return res.sendStatus(201);
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
}

const startGame = (req, res) => {
    const game = req.activeGames.get(req.session.id);
    return res.json(game.startGame());
}

const getIntroduction = (req, res) => {
    const game = req.activeGames.get(req.session.id);
    return res.json(game.getIntroduction());
}

const getQuestion = (req, res) => {
    const game = req.activeGames.get(req.session.id);
    return res.json(game.getQuestion());
}

const getHint = (req, res) => {
    const game = req.activeGames.get(req.session.id);
    return res.json(game.getHint());
}

const getHintCount = (req, res) => {
    const game = req.activeGames.get(req.session.id);
    return res.json(game.getHintCount());
}

const checkAnswer = (req, res) => {
    const game = req.activeGames.get(req.session.id);
    const { answer } = req.body;
    return res.json(game.checkAnswer(answer));
}

const checkTime = (req, res) => {
    const game = req.activeGames.get(req.session.id);
    return res.json(game.checkTime());
}

module.exports = {
    initializePlayer,
    startGame,
    getIntroduction,
    getQuestion,
    getHint,
    getHintCount,
    checkAnswer,
    checkTime
};