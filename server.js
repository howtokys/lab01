const ListingsDB = require("./modules/listingsDB.js");
const db = new ListingsDB();

const express = require('express');
const app = express();

const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Simple GET route
app.get('/', (req, res) => {
    res.json({ message: "API Listening" });
});

// Routes
app.post('/api/listings', async (req, res) => {
    try {
        const newListing = await db.addNewListing(req.body);
        res.status(201).json(newListing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/listings', async (req, res) => {
    const { page, perPage, name } = req.query;
    try {
        const listings = await db.getAllListings(parseInt(page), parseInt(perPage), name);
        res.json(listings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/listings/:id', async (req, res) => {
    try {
        const listing = await db.getListingById(req.params.id);
        if (listing) {
            res.json(listing);
        } else {
            res.status(404).json({ error: 'Listing not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/listings/:id', async (req, res) => {
    try {
        const result = await db.updateListingById(req.body, req.params.id);
        if (result.modifiedCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Listing not found or no changes made' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/listings/:id', async (req, res) => {
    try {
        const result = await db.deleteListingById(req.params.id);
        if (result.deletedCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Listing not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const HTTP_PORT = 8080;
db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
    app.listen(HTTP_PORT, ()=>{
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err)=>{
    console.log(err);
});
