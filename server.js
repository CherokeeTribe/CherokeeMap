const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

// MongoDB connection details
const uri = 'mongodb+srv://cherokeemap-main-db-0df912b1813:kmqxQApC761D19KWq8Ze6Rn1jCcTJR@prod-us-central1-1.lfuy1.mongodb.net/cherokeemap-main-db-0df912b1813?retryWrites=true&w=majority';
let db;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db('cherokeemap-main-db-0df912b1813'); // Your database name
    })
    .catch(error => console.error('Error connecting to MongoDB:', error));

// API to get all pins
app.get('/pins', (req, res) => {
    db.collection('pins').find().toArray((err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching pins' });
        }
        res.json(result);
    });
});

// API to add a new pin
app.post('/pins', (req, res) => {
    const newPin = req.body;
    db.collection('pins').insertOne(newPin, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error saving pin' });
        }
        res.status(201).json({ message: 'Pin saved', id: result.insertedId });
    });
});

// Set port from environment or fallback to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
