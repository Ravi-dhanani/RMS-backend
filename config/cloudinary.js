const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "ddcvmyis9",
  api_key: "315263714465336",
  api_secret: "8DRgrOXpMdD5Yzo-BPpYvi9SnTY",
});

module.exports = cloudinary;
