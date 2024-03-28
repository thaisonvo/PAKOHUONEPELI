const router = require('express').Router();
const fs = require('fs').promises;
const path = require('path');

module.exports = (activeGames, allEscapeRooms) => {
    router.post('/initializePlayer', (req, res) => {
        const { escapeRoom, playerName } = req.body;
        const escapeRoomData = allEscapeRooms.find(room => room.title === escapeRoom);

        const player = {
            name: playerName,
            escapeRoom: escapeRoomData.title,
            questions: escapeRoomData.problems,
            progress: 0,
            hintsLeft: 3,
            startTime: null,
            active: true
        }

        activeGames.set(req.session.id, player);
        res.sendStatus(201);
    });

    router.post('/startGame', (req, res) => {
        const player = activeGames.get(req.session.id);
        if (player) {
            player.startTime = Date.now();
            res.json({ started: true });
        } else {
            res.status(404).send('Pelaajaa ei löydy');
        }
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

        const ans = answer.replace(/\s/g, '').toLowerCase();
        const correct = currentQuestion.correctAnswer.replace(/\s/g, '').toLowerCase();

        if (ans === correct) {
            player.progress++;
        
            if (player.progress === player.questions.length) {
                //Calculating the end time of the game and the total elapsed time in milliseconds
                const endTime = Date.now();
                const elapsedTimeMs = endTime - player.startTime;

                //Convert the elapsed time into hours, minutes and seconds
                const seconds = Math.floor((elapsedTimeMs / 1000) % 60);
                const minutes = Math.floor((elapsedTimeMs / (1000 * 60)) % 60);
                const hours = Math.floor((elapsedTimeMs / (1000 * 60 * 60)) % 24);

                //Format the elapsed time as a string in the format HH:MM:SS
                const elapsedTimeString = [hours, minutes, seconds]
                .map(unit => unit.toString().padStart(2, '0'))
                .join(':');

                //Store the formatted elapsed time in the player's session data
                player.elapsedTime = elapsedTimeString;
                player.elapsedTimeMs = elapsedTimeMs;

                player.active = false;

                //Respond to the client indicating the game is finished and include the escape room identifier
                return res.json({ finished: true, escapeRoom: player.escapeRoom });
            } else {
                //If the game is not yet finished, respond indicating the answer was correct
                res.json({ correct: true });
            }
        } else {
            // ...and if the submitted answer is incorrect, respond indicating the answer was incorrect
            res.json({ correct: false });
        }
    });

    router.get('/checkTime', (req, res) => {
        const player = activeGames.get(req.session.id);
        if (!player) {
            return res.status(404).send('Pelaajaa ei löydy');
        }
        
        const timePassed = Math.floor((Date.now() - player.startTime) / 1000); // Time in seconds
        const timeLeft = (60 * 90) - timePassed; // Gametime 1h30min
    
        if (timeLeft <= 0) {
            // When time is over
            res.json({ timeIsUp: true });
        } else {
            // When there's still time left, check it constantly
            res.json({ timeIsUp: false, timeLeft: timeLeft });
        }
    });

    router.get('/writeScore', async (req, res) => {
        try {
            const player = activeGames.get(req.session.id);
            const data = await fs.readFile(path.join(__dirname, '..', 'leaderboard.json'), 'utf8');
            const leaderboard = JSON.parse(data);
            const leaderboardData = leaderboard[player.escapeRoom];

            leaderboardData.push({
                playerName: player.name,
                time: player.elapsedTime,
                ms: player.elapsedTimeMs
            });

            leaderboardData.sort((a, b) => a.ms - b.ms);

            await fs.writeFile(path.join(__dirname, '..', 'leaderboard.json'), JSON.stringify(leaderboard, null, 2), 'utf8');
            const rank = leaderboardData.findIndex(p => p.playerName === player.name) + 1;
            res.json({ rank });
            activeGames.delete(req.session.id);
        } catch (err) {
            res.sendStatus(500);
            console.error(err);
        }
    });

    return router;
}