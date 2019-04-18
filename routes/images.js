const express = require('express');
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "demo",
    allowedFormats: ["jpg", "png"],
    transformation: [{
        width: 500,
        height: 500,
        crop: "limit"
    }]
});

const parser = multer({
    storage: storage
});

Image = require('../models/image');

router.post('/upload', parser.single("image"), (req, res) => {
    const image = {};
    image.url = req.file.url;
    image.publicId = req.file.public_id;
    new Image(image).save() // save image information in database
        .then(newImage => res.json(newImage))
        .catch(err => console.log(err));
});

module.exports = router;