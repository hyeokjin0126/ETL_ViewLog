const express = require('express');
const bodyParser = require('body-parser');

const AWS = require('aws-sdk');
require('dotenv').config("./");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

// routes
app.use('/', require("./routes/index.js"));
app.use('/watch', require("./routes/watch.js"));

// static
app.use(express.static("public"));
app.use(express.static("views"));

// 
app.listen(8080, () => console.log(`http://localhost:8080`));