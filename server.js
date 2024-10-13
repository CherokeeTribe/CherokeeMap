// server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const pinsFolder = path.join(__dirname, 'pins');

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Ensure the pins folder exists
if (!fs.existsSync(pinsFolder)) {
    fs.mkdirSync(pinsFolder);
}

// API to get all pins
app.get('/pins', (req, res) => {
    fs.readdir(pinsFolder, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading pins folder' });
        }

        const allPins = [];
        if (files.length === 0) {
            return res.json(allPins); // Return empty array if no pins
        }

        files.forEach(file => {
            const pinData = fs.readFileSync(path.join(pinsFolder, file));
            allPins.push(JSON.parse(pinData));
        });

        res.json(allPins);
    });
});

// API to add a new pin
app.post('/pins', (req, res) => {
    const newPin = req.body;
    const pinId = newPin.id;

    fs.writeFileSync(path.join(pinsFolder, `${pinId}.json`), JSON.stringify(newPin));
    res.status(201).json({ message: 'Pin saved' });
});

// Set port from environment (Render uses this) or fallback to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
