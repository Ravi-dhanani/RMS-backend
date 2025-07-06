var express = require("express");
var cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");
var Heaight = require("./routes/Heaight.route.js");
var Auth = require("./routes/Auth.route.js");
var Building = require("./routes/Building.route.js");
var Flour = require("./routes/Flour.route.js");
var Flat = require("./routes/Flat.route.js");
var Image = require("./routes/Image.route.js");
const connectDB = require("./config/config.js");

var app = express();
const PORT = process.env.PORT || 5353;

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
connectDB();
app.use("/api/auth", Auth);
app.use("/api/Heaight", Heaight);
app.use("/api/Building", Building);
app.use("/api/Flour", Flour);
app.use("/api/Flat", Flat);
app.use("/api/assets", Image);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// error handler
module.exports = app;
