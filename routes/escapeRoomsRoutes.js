const router = require("express").Router();
const { getEscapeRooms } = require("../controllers/escapeRoomsController");

router.get("/", getEscapeRooms);

module.exports = router;