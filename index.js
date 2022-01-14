require('dotenv').config();

var express = require("express");

const { dbConnection } = require('./database/config');
// const mongoose = require('mongoose');


// crear servidor express
var app = express();

// lectura y parseo del body
app.use(express.json());

// Base de datos
dbConnection();

// Node Server
const server = require('http').createServer(app);


app.use('/api/webhook', require('./routes/webhook'));

server.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en puerto ' + process.env.PORT);
});