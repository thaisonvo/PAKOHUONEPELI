const express = require("express");
const http = require("http");
const fs = require("fs");

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
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

const port = 3000;
server.listen(port, () => {
    console.log(`\nServer is running on http://localhost:${port}`);
})