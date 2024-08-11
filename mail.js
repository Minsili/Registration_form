const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const port = 3000;

// Set up body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Serve the registration form at the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Handle form submission
app.post(
  "/register",
  upload.fields([
    { name: "diploma", maxCount: 1 },
    { name: "transcript", maxCount: 1 },
    { name: "inscription", maxCount: 1 },
  ]),
  (req, res) => {
    console.log("Received POST request at /register");
    const { name, sname, degree } = req.body;
    const diplomaFile = req.files["diploma"]
      ? req.files["diploma"][0].filename
      : null;
    const transcriptFile = req.files["transcript"]
      ? req.files["transcript"][0].filename
      : null;
    const inscriptionFile = req.files["inscription"]
      ? req.files["inscription"][0].filename
      : null;

    if (
      !name ||
      !sname ||
      !degree ||
      !diplomaFile ||
      !transcriptFile ||
      !inscriptionFile
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing form fields." });
    }

    // Send email with user registration details
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email address
      to: process.env.EMAIL_USER, // Recipient's email address
      subject: "New User Registration",
      text: `A new user has registered with the following details:
                  Name: ${name}
                  Surname: ${sname}
                  Degree: ${degree}
                  Diploma File: ${diplomaFile}
                  Transcript File: ${transcriptFile}
                  Inscription File: ${inscriptionFile}`,
      // Optionally, you can attach files
      attachments: [
        {
          filename: diplomaFile,
          path: path.join(__dirname, "uploads", diplomaFile),
        },
        {
          filename: transcriptFile,
          path: path.join(__dirname, "uploads", transcriptFile),
        },
        {
          filename: inscriptionFile,
          path: path.join(__dirname, "uploads", inscriptionFile),
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error.message);
        return res.status(500).json({
          success: false,
          message: "Registration successful, but failed to send email.",
        });
      }
      console.log("Email sent:", info.response);
      res.json({ success: true, message: "Registration successful!" });
    });
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
