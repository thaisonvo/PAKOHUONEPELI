const router = require('express').Router();
const path = require('path');

router.get("/maingamepage", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'maingamepage.html'));
});

router.get("/congratulations", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'congratulations.html'))
});

module.exports = router;