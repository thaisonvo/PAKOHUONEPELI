const { readFileJSON } = require("../utilities/fileOperations");
const path = require("path");

const getEscapeRooms = async (req, res) => {
    try {
        const escapeRooms = await readFileJSON(path.join(__dirname, "..", "allEscapeRooms.json"));
        const escapeRoomsTitles = escapeRooms.map(room => room.title);
        return res.json(escapeRoomsTitles);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

module.exports = { getEscapeRooms };