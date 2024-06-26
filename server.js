const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'private')));
app.use(session({
    secret: process.env.SECRET || 'qwerty',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 4 * 60 * 60 * 1000, // Session expires in 4 hours
        httpOnly: true
    }
}));

app.use("/", require("./routes/pageRoutes"));
app.use("/game", require("./routes/gameRoutes"));
app.use("/leaderboard", require("./routes/leaderboardRoutes"));
app.use("/escape-rooms", require("./routes/escapeRoomsRoutes"));

app.get('/admin/home', (req, res) => {
    const indexPath = path.join(__dirname, 'private', 'indexAdmin.html');
    res.sendFile(indexPath);
});

app.get('/admin/add-room', (req, res) => {
    const adminPagePath = path.join(__dirname, 'private', 'AdminAddRooms.html');
    //Here you can add authentication mechanism if needed

    res.sendFile(adminPagePath);
});

app.get('/admin/edit-room', (req, res) => {
    const editPagePath = path.join(__dirname, 'private', 'AdminEditRooms.html');
    res.sendFile(editPagePath);
});

app.get('/admin/delete-room', (req, res) => {
    const pagePath = path.join(__dirname, 'private', 'AdminDeleteRooms.html');
    res.sendFile(pagePath);
});

app.get('/admin/page', (req, res) => {
    const AdminToolsPath = path.join(__dirname, 'private', 'indexAdmin.html');
    res.sendFile(AdminToolsPath);
})

//Check the adminPassword
app.post('/api/checkPassword', (req, res) => {
    const { password } = req.body;

    if (password == "Kao2023!") {
        res.json({ success: true});
    } else {
        res.json({ success: false });
    }
});

// Add new escape room
app.post("/escapeRoom", (req, res) => {
    const newRoom = req.body;

    // Reading existing escape rooms
    fs.readFile("allEscapeRooms.json", "utf8", (err, data) => {
        if (err) {
            res.status(500).send("Error reading escape rooms data");
            return;
        }
        const rooms = JSON.parse(data);

        //Check if title already exists
        if (rooms.some(room => room.title.toLowerCase() === newRoom.title.toLowerCase())) {
            res.status(400).send("Escape room with the same name already exists");
            return;
        }

        rooms.push(newRoom); // Adding new escape room to the list

        // Writing updated list back to the file
        fs.writeFile("allEscapeRooms.json", JSON.stringify(rooms, null, 2), "utf8", err => {
            if (err) {
                res.status(500).send("Error saving new escape room");
                return;
            }

            // After successfully adding the new room, update leaderboard.json
            fs.readFile("leaderboard.json", "utf8", (err, leaderboardData) => {
                if (err) {
                    res.status(500).send("Error reading leaderboard data");
                    return;
                }
                const leaderboard = JSON.parse(leaderboardData);
                
                // Add new room to leaderboard with an empty array
                leaderboard[newRoom.title] = [];

                // Write updated leaderboard back to the file
                fs.writeFile("leaderboard.json", JSON.stringify(leaderboard, null, 2), "utf8", err => {
                    if (err) {
                        res.status(500).send("Error updating leaderboard");
                        return;
                    }
                    res.status(201).json({message: "Escape room and leaderboard updated succesfully"});
                });
            });
        });
    });
});

// Listing all escape rooms
app.get('/escapeRoom/list', (req, res) => {
    fs.readFile("allEscapeRooms.json", "utf8", (err, data) => {
        if (err) {
            res.status(500).send("Error reading escape rooms data");
            return;
        }
        const rooms = JSON.parse(data);
        res.json(rooms);
    });
});

// Deleting selected escape room
app.post("/escapeRoom/delete", (req, res) => {
    const { title } = req.body;

    fs.readFile("allEscapeRooms.json", "utf8", (err, data) => {
        if (err) {
            res.status(500).send("Error reading escape rooms data");
            return;
        }
        let rooms = JSON.parse(data);
        rooms = rooms.filter(room => room.title !== title); // Deleting escape room

        fs.writeFile("allEscapeRooms.json", JSON.stringify(rooms, null, 2), "utf8", err => {
            if (err) {
                res.status(500).send("Error saving the updated escape rooms list");
                return;
            }
            // After successfully deleting the room, update leaderboard.json
            fs.readFile("leaderboard.json", "utf8", (err, leaderboardData) => {
                if (err) {
                    res.status(500).send("Error reading leaderboard data");
                    return;
                }
                let leaderboard = JSON.parse(leaderboardData);
                
                // Check if the room exists in the leaderboard and delete it
                if (leaderboard[title]) {
                    delete leaderboard[title]; // Remove the room from leaderboard

                    // Write the updated leaderboard back to the file
                    fs.writeFile("leaderboard.json", JSON.stringify(leaderboard, null, 2), "utf8", err => {
                        if (err) {
                            res.status(500).send("Error updating leaderboard");
                            return;
                        }
                        res.json({message: "Escape room and leaderboard deleted successfully"});
                    });
                } else {
                    res.json({message: "Escape room deleted successfully, no leaderboard entry found."});
                }
            });
        });
    });
});


//Defining a GET route to fetch the details of an escape room by its title
app.get('/escapeRoom/:title', (req, res) => {
    const { title } = req.params;

    // Reading the JSON file containin all escape rooms data
    fs.readFile("allEscapeRooms.json", "utf8", (err, data) => {
        if (err) {
            // If there is an error reading the file, send a 500 (Internal Server Error) response
            res.status(500).send("Error reading escape rooms data");
            return;
        }
        const rooms = JSON.parse(data); // Parsing the JSON data into an array of rooms
        const room = rooms.find(r => r.title === title); // Find the room with the matching title
        if (room) {
            // If the room is found, respond with the room's details as JSON
            res.json(room);
        } else {
            // ... if not, send a 404 (Not found) response.
            res.status(404).send("Escape room not found");
        }
    });
});

// Defining a POST route to update the details of an escape room
app.post('/escapeRoom/update', (req, res) => {
    const { originalTitle, newTitle, description, videoLink, problems } = req.body;

    // Read the JSON file containing all escape rooms data
    fs.readFile("allEscapeRooms.json", "utf8", (err, data) => {
        if (err) {
            // If there is an error reading file, send a 500 response
            res.status(500).send("Error reading escape rooms data");
            return;
        }

        let rooms;
        try {
            rooms = JSON.parse(data);
        } catch (parseError) {
            res.status(500).send("Failed to parse escape rooms data");
            return;
        }

        // Checking if the new title is already in use by another room, excluding the room being updated 
        if (rooms.some(room => room.title.toLowerCase() === newTitle.toLowerCase() && room.title.toLowerCase() !== originalTitle.toLowerCase())) {
            // If another room with the same new title exists, send a 400 (Bad request) response
            return res.status(400).send("Another escape room with the same name already exists. Please choose a different name.");
        }

        // Find the index of the room to update based on the original title
        const roomIndex = rooms.findIndex(r => r.title.toLowerCase() === originalTitle.toLowerCase());

        if (roomIndex !== -1) {
            // Update the room's details if it is found
            rooms[roomIndex] = { title: newTitle, description, videoLink, problems };
            
            // Write the updated array of rooms back to the JSON file
            fs.writeFile("allEscapeRooms.json", JSON.stringify(rooms, null, 2), "utf8", err => {
                if (err) {
                    res.status(500).send("Error saving updated escape room");
                    return;
                }
                // After successfully updating the room, update leaderboard.json
                fs.readFile("leaderboard.json", "utf8", (err, leaderboardData) => {
                    if (err) {
                        res.status(500).send("Error reading leaderboard data");
                        return;
                    }
                    let leaderboard;
                    try {
                        leaderboard = JSON.parse(leaderboardData);
                    } catch (parseError) {
                        res.status(500).send("Failed to parse leaderboard data");
                        return;
                    }
                    
                    if (originalTitle !== newTitle) { // Only update if the title has changed
                        if (leaderboard[originalTitle]) {
                            leaderboard[newTitle] = leaderboard[originalTitle];
                            delete leaderboard[originalTitle];
                        }
                    }

                    // Write the updated leaderboard back to the file
                    fs.writeFile("leaderboard.json", JSON.stringify(leaderboard, null, 2), "utf8", err => {
                        if (err) {
                            res.status(500).send("Error updating leaderboard");
                            return;
                        }
                        // If the update is successful, send a 200 (OK) response with a success message
                        res.status(200).json({message: "Escape room and leaderboard updated successfully"});
                    });
                });
            });
        } else {
            res.status(404).send("Escape room not found");
        }
    });
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`\nServer is running on http://localhost:${port}`);
});
