// server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const pinsFolder = path.join(__dirname, 'pins');

// Middleware to serve static files (HTML, JS, images) and parse JSON
app.use(express.static(__dirname));
app.use(bodyParser.json());

// Create the pins folder if it doesn't exist
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

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
