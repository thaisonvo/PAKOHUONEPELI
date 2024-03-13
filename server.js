const express = require("express");
const session = require("express-session");
const http = require("http");
const fs = require("fs");
const path = require('path');
const allData = require("./allEscapeRooms.json");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: "fsjlkdhoHRUQWDUJOASFjksdha",
    resave: false,
    saveUninitialized: true
}))

// The map where all active games are stored.
let activeGamesMap = new Map();

// Endpoint to fetch information about a specific escape room.
app.get("/escapeRoomInfo/:escapeRoom", (req, res) => {
    console.log(`\nRequest received at /escapeRoomInfo: \n${req.session.id}`);

    // Find data of the escape room.
    const escapeRoomData = allData.find(room => room.title === req.params.escapeRoom);
    // Extract the player's unique session ID from 'req.session'.
    const sessionId = req.session.id;

    // Initialize player data if not already initialized.
    initializePlayerData(sessionId, escapeRoomData);

    // Send a response to the client with information about the escape room.
    res.status(200).json({
        title: escapeRoomData.title,
        description: escapeRoomData.description,
        videoLink: escapeRoomData.videoLink
    })
})

// Endpoint to fetch information about the current game state.
app.get("/game", (req, res) => {
    console.log(`\nRequest received at /game: ${req.session.id}`);

    // Fetch player data from 'activeGamesMap'.
    const playerData = activeGamesMap.get(req.session.id);
    // Fetch the current question for the player.
    const currentQuestion = playerData.questions[playerData.progress];

    // Send a response to the client with information about the current question.
    res.status(200).json({
        title: currentQuestion.title,
        description: currentQuestion.description,
        videoLink: currentQuestion.videoLink
    })
})

// Endpoint to handle submissions of answers to questions.
app.post("/answerSubmission", (req, res) => {
    console.log(`\nRequest received at /answerSubmission: ${req.session.id}`);

    // Fetch player data fromm 'activeGamesMap'.
    const playerData = activeGamesMap.get(req.session.id);
    // Extract the inputted answer from 'req.body'.
    const answer = req.body.answer;
    // Fetch the correct answer for the current question.
    const correctAnswer = playerData.questions[playerData.progress].correctAnswer;

    // Check if the answer is correct.
    if (answer === correctAnswer) {
        // If correct, update player progress and reset hints used.
        playerData.progress += 1;
        playerData.hintsUsed = 0;
        // Redirect player to "/game" to fetch the next question.
        res.redirect("/game");
    } else {
        // Send an error response with a message.
        res.status(422).json({ error: "Annettu vastaus on väärin. Yritä uudelleen." });
    }
})

// Endpoint to handle requests for hints.
app.get("/hint", (req, res) => {
    console.log(`\nRequest received at /hint: ${req.session.id}`);

    // Fetch player data.
    const playerData = activeGamesMap.get(req.session.id);
    // Fetch the hint for the current question.
    const hint = playerData.questions[playerData.progress].hints[playerData.hintsUsed];

    // Check if the player has any available hints left.
    if (!hint) {
        // If not, send a response with a message and return from the function.
        res.status(422).send("Olet käyttänyt kaikki vihjeet tälle kysymykselle!");
        return;
    }

    // Increment the player's 'hintsUsed' attribute and send a response with the hint.
    playerData.hintsUsed += 1;
    res.status(200).send(hint);
})

// Endpoint to serve the main game page.
app.get("/maingamepage", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'maingamepage.html'));
})

app.get("/allEscapeRooms", (req, res) => {
    fs.readFile("allEscapeRooms.json", "utf8", (err, data) => {
        if (err) {
            res.status(500).send();
            return;
        }
        res.json(JSON.parse(data));
    })
})

// Initialize player data if not already initialized.
function initializePlayerData(sessionId, escapeRoomData) {

    // Avoid creating a new 'playerData' object if the user already has an ongoing game.
    if (activeGamesMap.has(sessionId)) return;

    // Initialize player data.
    const playerData = {
        questions: escapeRoomData.problems,
        progress: 0,
        hintsUsed: 0
    }

    // Add 'playerData' to 'activeGamesMap' with 'sessionId' as the key and 'playerData' as the value.
    activeGamesMap.set(sessionId, playerData);
}


const port = 3000;
server.listen(port, () => {
    console.log(`\nServer is running on http://localhost:${port}`);
})