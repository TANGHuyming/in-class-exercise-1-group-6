const express = require('express');
const path = require('path');
const fs = require('fs');
const multiparty = require('multiparty');
const hbs = require('hbs');
const data = require('./data');

const app = express();
const PORT = 3000;

// Set up Handlebars as the view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
// This allows us to serve CSS, images, and uploaded files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse application/x-www-form-urlencoded data (text forms)
// This is for standard HTML form submissions WITHOUT file uploads
// It reads the request body and populates req.body with key-value pairs
app.use(express.urlencoded({ extended: false }));

// Middleware to parse application/json payloads (Fetch API demos)
app.use(express.json());

// disable x-powered-by
app.disable('x-powered-by')

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/report', (req, res) => {
    res.render('report')
})

app.get('/dashboard', (req, res) => {
    res.render('dashboard')
})

app.get('/items', (req, res) => {
    
    res.render('items')
})

app.listen(PORT, () => {
    console.log("Server started in port", PORT)
})