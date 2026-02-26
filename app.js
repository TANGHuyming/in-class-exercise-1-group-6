const express = require('express');
const path = require('path');
const fs = require('fs');
const multiparty = require('multiparty');
const data = require('./data');
const hbs = require('hbs');
let {data} = require('./data');

const app = express();
const PORT = 3000;

const data = require("./data");

console.log(data);

// Set up Handlebars as the view engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the 'public' directory
// This allows us to serve CSS, images, and uploaded files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse application/x-www-form-urlencoded data (text forms)
// This is for standard HTML form submissions WITHOUT file uploads
// It reads the request body and populates req.body with key-value pairs
app.use(express.urlencoded({ extended: false }));

// Middleware to parse application/json payloads (Fetch API demos)
app.use(express.json());
hbs.registerPartials(path.join(__dirname, "views/partials"));

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

    // console.log(params.id)

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
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/report", (req, res) => {
  res.render("report");
});

app.get("/dashboard", (req, res) => {
  try {
    // Dataset demonstrating conditional and iteration helpers
    const context = {
      pageTitle: "Items Records",
      data: [
        {
          id: "unique_string",
          name: "Blue Wallet",
          description: "Leather wallet with student ID",
          location: "Library Hall B",
          date: "2023-10-25",
          contact: "student@univ.edu",
          imagePath: "/uploads/filename.jpg",
          status: "Lost",
        },
      ],
    };

    // Render dashboard.handlebars with the context data
    res.render("dashboard", context);
  } catch (error) {
    console.error("Error rendering students page:", error);
    res.status(500).send("Error rendering page");
  }
});

app.get("/items", (req, res) => {
  res.render("items");
// In-memory reports array 
const reports = [];

app.get('/upload', (req, res) => {
  res.render('upload');
});

// Upload directory
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.post('/upload', (req, res) => {
  try {
    const form = new multiparty.Form();

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('❌ Form parse error:', err);
        return res.status(400).render('dashboard', {
          type: 'error',
          message: 'Error parsing form data.',
        });
      }

      /* ============================================
         EXTRACT FIELDS
      ============================================ */

      const itemName = fields.name?.[0];
      const description = fields.desc?.[0];
      const location = fields.location?.[0];
      const date = fields.date?.[0];
      const contact = fields.contact?.[0];

      /* ============================================
         VALIDATE FIELDS
      ============================================ */

      if (!itemName || !description || !location || !date || !contact) {
        return res.status(400).render('dashboard', {
          type: 'error',
          message: 'All fields are required.',
        });
      }

      /* ============================================
         VALIDATE FILE
      ============================================ */

      if (!files.image || files.image.length === 0) {
        return res.status(400).render('result', {
          type: 'error',
          message: 'Image file is required.',
        });
      }

      const file = files.image[0];
      const originalName = file.originalFilename;
      const tempPath = file.path;

      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      const ext = path.extname(originalName).toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        fs.unlinkSync(tempPath);
        return res.status(400).render('result', {
          type: 'error',
          message: 'Only JPG and PNG images are allowed.',
        });
      }

      /* ============================================
         SAVE FILE
      ============================================ */

      const fileName = `${Date.now()}_${originalName}`;
      const finalPath = path.join(uploadsDir, fileName);

      fs.copyFileSync(tempPath, finalPath);
      fs.unlinkSync(tempPath);

      const imagePath = `/uploads/${fileName}`;

      /* ============================================
         PUSH REPORT OBJECT
      ============================================ */

      const newReport = {
        itemName,
        description,
        location,
        date,
        contact,
        imagePath,
        status: 'Lost',
      };

      reports.push(newReport);

      console.log('📦 Report added:', newReport);
      console.log('📊 Total reports:', reports.length);

      /* ============================================
         RESPONSE
      ============================================ */

      res.render('dashboard', 
        {
        type: 'success',
        message: 'Report submitted successfully!',
        report: newReport,
      }
    );
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).render('result', {
      type: 'error',
      message: 'Server error occurred.',
    });
  }
});

app.listen(PORT, () => {
  console.log("Server started in port", PORT);
});
