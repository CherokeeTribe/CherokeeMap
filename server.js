const express = require('express');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const uri = 'your_mongodb_connection_string'; // Replace with your MongoDB URI
let db;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db('cherokee-map');
    })
    .catch(error => console.error('Error connecting to MongoDB:', error));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');  // Make sure this folder exists
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
            return res.status(500).json({ message: 'Error fetching pins' });
        }
        res.json(result);
    });
});

// API to add a new pin with optional screenshot
app.post('/pins', upload.single('screenshot'), (req, res) => {
    const newPin = JSON.parse(req.body.pin);
    
    if (req.file) {
        newPin.screenshot = `/uploads/${req.file.filename}`;
    }

    db.collection('pins').insertOne(newPin, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error saving pin' });
        }
        res.status(201).json({ message: 'Pin saved', id: result.insertedId });
    });
});

// API to delete a pin
app.delete('/pins/:id', (req, res) => {
    const pinId = parseInt(req.params.id);
    db.collection('pins').deleteOne({ id: pinId }, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting pin' });
        }
        res.status(200).json({ message: 'Pin deleted' });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
