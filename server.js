const express = require('express');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const uri = 'mongodb+srv://cherokeemap-main-db-0df912b1813:kmqxQApC761D19KWq8Ze6Rn1jCcTJR@prod-us-central1-1.lfuy1.mongodb.net/?retryWrites=true&w=majority';  // Correct MongoDB URI

let db;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db('cherokeemap-main-db-0df912b1813');  // Ensure the correct database name
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);  // Exit the process if the connection fails
    });

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');  // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// API to get all pins
app.get('/pins', (req, res) => {
    db.collection('pins').find().toArray((err, result) => {
        if (err) {
            console.error('Error fetching pins:', err);
            return res.status(500).json({ message: 'Error fetching pins' });
        }
        res.status(200).json(result);  // Send the pins as JSON
    });
});

// API to add a new pin with optional screenshot
app.post('/pins', upload.single('screenshot'), (req, res) => {
    try {
        // Parse the pin data from the request body
        const newPin = JSON.parse(req.body.pin);

        // Check if latitude and longitude are valid
        if (!newPin.lat || !newPin.lng) {
            return res.status(400).json({ message: 'Invalid pin data: missing lat/lng' });
        }

        // Add screenshot path if file is uploaded
        if (req.file) {
            newPin.screenshot = `/uploads/${req.file.filename}`;
        }

        // Insert the pin into MongoDB
        db.collection('pins').insertOne(newPin, (err, result) => {
            if (err) {
                console.error('Error saving pin to MongoDB:', err);  // Log detailed error
                return res.status(500).json({ message: 'Error saving pin to MongoDB' });
            }

            // Successfully inserted pin
            res.status(201).json({ message: 'Pin saved', id: result.insertedId });
        });
    } catch (error) {
        console.error('Error processing pin data:', error);  // Log detailed error
        res.status(400).json({ message: 'Invalid pin data format' });
    }
});

// API to delete a pin
app.delete('/pins/:id', (req, res) => {
    const pinId = req.params.id;  // Assuming pinId is stored as a string, not an integer
    db.collection('pins').deleteOne({ id: pinId }, (err, result) => {
        if (err) {
            console.error('Error deleting pin:', err);
            return res.status(500).json({ message: 'Error deleting pin' });
        }
        res.status(200).json({ message: 'Pin deleted' });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
