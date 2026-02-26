const express = require('express');
const path = require('path');
const fs = require('fs');
const multiparty = require('multiparty');
const hbs = require('hbs');
let {data} = require('./data');

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

// app.get('/', (req, res) => {
//     res.render('index')
// })

// app.get('/report', (req, res) => {
//     res.render('report')
// })

// app.get('/dashboard', (req, res) => {
//     res.render('dashboard')
// })

app.get('/items/:id', (req, res) => {
    // grab url params
    const params = req.params

    console.log(params.id)

    // filter data array with the id
    const context = data.find((d) => d.id === params.id)

    res.render('items', context)
})

app.post('/items/:id/status', (req, res) => {
    // change status of data
    const params = req.params
    const body = req.body

    const changedItem = data.find((d) => d.id === params.id)
    changedItem.status = body.status

    data = data.filter((d) => d.id !== params.id)
    data.push(changedItem)

    res.redirect(`/items/${params.id}`)
})

app.post('/items/:id/delete', (req, res) => {
    const params = req.params
    
    // delete the specific data from data array
    data = data.filter((d) => d.id !== params.id)

    res.redirect('/dashboard')
})

app.listen(PORT, () => {
    console.log("Server started in port", PORT)
})