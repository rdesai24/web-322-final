/*********************************************************************************
WEB322 – Assignment 02

I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source
(including 3rd party websites) or distributed to other students.

Name: Rushabh Desai
Student ID: 190713230
Date: 6-january-2025

Cyclic Web App URL: 
GitHub Repository URL: 
********************************************************************************/

const express = require("express");
const path = require("path");
const storeService = require("./store-service");

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from 'public' directory
app.use(express.static("public"));

// Redirect root to /about
app.get("/", (req, res) => {
    res.redirect("/about");
});

// Serve About Page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views/about.html"));
});

// Get all published items
app.get("/shop", (req, res) => {
    storeService.getPublishedItems()
        .then(items => res.json(items))
        .catch(err => res.status(404).json({ message: err }));
});

// Get all items
app.get("/items", (req, res) => {
    storeService.getAllItems()
        .then(items => res.json(items))
        .catch(err => res.status(404).json({ message: err }));
});

// Get all categories
app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(404).json({ message: err }));
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize the store service before starting the server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express HTTP server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Failed to initialize: ${err}`);
    });

    