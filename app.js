const express = require('express');
const path = require('path');
const fs = require('fs');
const multiparty = require('multiparty');
const data = require('./data');
const hbs = require('hbs');

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

// app.get('/', (req, res) => {
//     res.render('index')
// })

// app.get('/dashboard', (req, res) => {
//     res.render('dashboard')
// })

// app.get('/items', (req, res) => {
//     res.render('items')
// })


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
        return res.status(400).render('result', {
          type: 'error',
          message: 'Error parsing form data.',
        });
      }

      /* ============================================
         EXTRACT FIELDS
      ============================================ */

      const itemName = fields.itemName?.[0];
      const description = fields.desc?.[0];
      const location = fields.location?.[0];
      const date = fields.date?.[0];
      const email = fields.email?.[0];

      /* ============================================
         VALIDATE FIELDS
      ============================================ */

      if (!itemName || !description || !location || !date || !email) {
        return res.status(400).render('result', {
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
        email,
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
    //     {
    //     type: 'success',
    //     message: 'Report submitted successfully!',
    //     report: newReport,
    //   }
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
    console.log("Server started in port", PORT)
})