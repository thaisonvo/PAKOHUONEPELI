const express = require('express');
const router = express.Router();

module.exports = (activeGames, allEscapeRooms) => {
    router.post('/initializePlayer', (req, res) => {
        const { escapeRoom, playerName } = req.body;
        const escapeRoomData = allEscapeRooms.find(room => room.title === escapeRoom);

        const player = {
            name: playerName,
            escapeRoom: escapeRoomData.title,
            questions: escapeRoomData.problems,
            progress: 0,
            hintsLeft: 3
        }

        activeGames.set(req.session.id, player);
        res.sendStatus(201);
    });

    router.get('/getIntroduction', (req, res) => {
        const player = activeGames.get(req.session.id);
        const escapeRoomData = allEscapeRooms.find(room => room.title === player.escapeRoom);
        res.json({
            title: escapeRoomData.title,
            description: escapeRoomData.description,
            video: escapeRoomData.videoLink
        });
    });

    router.get('/getQuestion', (req, res) => {
        const player = activeGames.get(req.session.id);
        const currentQuestion = player.questions[player.progress];
        res.json({
            title: currentQuestion.title,
            description: currentQuestion.description,
            video: currentQuestion.videoLink
        });
    });

    router.get('/getHint', (req, res) => {
        const player = activeGames.get(req.session.id);
        const currentQuestion = player.questions[player.progress];
        if (player.hintsLeft > 0) {
            player.hintsLeft--;
            res.json({ hint: currentQuestion.hint });
        } else {
            res.json({ hint: 'Ei vihjeitä jäljellä!' });
        }
    });

    router.post('/checkAnswer', (req, res) => {
        const player = activeGames.get(req.session.id);
        const { answer } = req.body;
        const currentQuestion = player.questions[player.progress];
        
        if (player.progress === player.questions.length - 1) {
            return res.json({ finished: true, escapeRoom: player.escapeRoom });
        }

        if (answer === currentQuestion.correctAnswer) {
            player.progress++;
            res.json({ correct: true });
        } else {
            res.json({ correct: false });
        }
    });

    return router;
}