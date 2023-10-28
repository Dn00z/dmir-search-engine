const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/search', require('./routes/searchRoutes'));
app.use('/config', require('./routes/configRoutes'));


module.exports = app;

