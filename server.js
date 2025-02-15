
/********************************************************************************
* BTI425 – Assignment 1
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: ___Thuong Tuyen Tran____ Student ID: ___161527239__ Date: 1/17/2025___
*
* Published URL: https://lab01-howtokys-projects.vercel.app/
*
********************************************************************************/
const ListingsDB = require("./modules/listingsDB.js");
const db = new ListingsDB();

const express = require('express');
const app = express();

const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB before handling any requests
let dbInitialized = false;

// Middleware to check DB connection
app.use(async (req, res, next) => {
    if (!dbInitialized) {
        try {
            await db.initialize(process.env.MONGODB_CONN_STRING);
            dbInitialized = true;
            next();
        } catch (err) {
            res.status(500).json({ error: "Database connection failed" });
        }
    } else {
        next();
    }
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: "API Listening" });
});

app.post('/api/listings', async (req, res) => {
    try {
        if (!db.Listing) {
            throw new Error("Database not initialized");
        }
        const newListing = await db.addNewListing(req.body);
        res.status(201).json(newListing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/listings', async (req, res) => {
    const { page, perPage, name } = req.query;
    try {
        if (!db.Listing) {
            throw new Error("Database not initialized");
        }
        const listings = await db.getAllListings(Number(page), Number(perPage), name);
        res.status(200).json(listings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/listings/:id', async (req, res) => {
    try {
        if (!db.Listing) {
            throw new Error("Database not initialized");
        }
        const listing = await db.getListingById(req.params.id);
        if (listing) {
            res.status(200).json(listing);
        } else {
            res.status(404).json({ error: "Listing not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/listings/:id', async (req, res) => {
    try {
        if (!db.Listing) {
            throw new Error("Database not initialized");
        }
        const result = await db.updateListingById(req.body, req.params.id);
        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Listing updated successfully" });
        } else {
            res.status(404).json({ error: "Listing not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/listings/:id', async (req, res) => {
    try {
        if (!db.Listing) {
            throw new Error("Database not initialized");
        }
        const result = await db.deleteListingById(req.params.id);
        if (result.deletedCount > 0) {
            res.status(200).json({
                success: true,
                message: "Listing deleted successfully",
                deletedId: req.params.id
            });
        } else {
            res.status(404).json({ 
                success: false,
                error: "Listing not found" 
            });
        }
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
});

// Port and Server Initialization
const HTTP_PORT = process.env.PORT || 8080;

db.initialize(process.env.MONGODB_CONN_STRING)
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server listening on: ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });

// Export for Vercel
module.exports = app;
