var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const connectDB = require("./config/config");

var app = express();
const PORT = process.env.PORT || 5353;

// Middleware setup
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
connectDB();
app.use("/", indexRouter);
app.use("/api/auth", usersRouter);

// catch 404 and forward to error handler
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// error handler
module.exports = app;
