/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Rushabh Desai Student ID: 190713230  Date: 03-05-2025
*
*  Cyclic Web App URL: ________________________________________________________
* 
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/

const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const storeService = require("./store-service");

const app = express();
const PORT = process.env.PORT || 8080;

// Cloudinary Configuration (Replace with your actual keys)
cloudinary.config({
    cloud_name: "YOUR_CLOUD_NAME",
    api_key: "YOUR_API_KEY",
    api_secret: "YOUR_API_SECRET",
    secure: true
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Multer setup (no disk storage)
const upload = multer();

// Route to serve the "Add Item" page
app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views/addItem.html"));
});

// Route to handle item submission
app.post("/items/add", upload.single("featureImage"), (req, res) => {
    let processItem = (imageUrl) => {
        req.body.featureImage = imageUrl;
        
        // Add the item to store-service
        storeService.addItem(req.body)
            .then(() => res.redirect("/items"))
            .catch(err => res.status(500).send("Error adding item"));
    };

    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then(uploaded => {
            processItem(uploaded.url);
        });
    } else {
        processItem("");
    }
});

// Route to display items (modified to support filtering)
app.get("/items", (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then(items => res.json(items))
            .catch(err => res.status(404).json({ message: err }));
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then(items => res.json(items))
            .catch(err => res.status(404).json({ message: err }));
    } else {
        res.json(storeService.getAllItems());
    }
});

// Route to get a single item by ID
app.get("/item/:id", (req, res) => {
    storeService.getItemById(req.params.id)
        .then(item => res.json(item))
        .catch(err => res.status(404).json({ message: err }));
});

// Default route
app.get("/", (req, res) => {
    res.send("<h1>Welcome to the Store App</h1><p>Navigate to /items to view all items.</p>");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
