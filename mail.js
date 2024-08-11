const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const fs = require("fs");
const nodemailer = require("nodemailer");

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

// Initialize MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "registration_db",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database.");

  db.query(
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        diplomaFile VARCHAR(255) NOT NULL,
        transcriptFile VARCHAR(255) NOT NULL,
        inscriptionFile VARCHAR(255) NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("Table created or already exists.");
      }
    }
  );
});

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use SSL/TLS
  auth: {
    user: "dianeminou2@gmail.com",
    pass: "waoh boys gone rufx",
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

    // Insert data into the database
    db.query(
      `INSERT INTO users (name, surname, degree, diplomaFile, transcriptFile, inscriptionFile)
         VALUES (?, ?, ?, ?, ?, ?)`,
      [name, sname, degree, diplomaFile, transcriptFile, inscriptionFile],
      (err) => {
        if (err) {
          console.error("Error inserting data:", err.message);
          return res
            .status(500)
            .json({ success: false, message: "Registration failed." });
        }
        console.log("Data inserted:", {
          name,
          sname,
          degree,
          diplomaFile,
          transcriptFile,
          inscriptionFile,
        });

        // Send email with user registration details
        const mailOptions = {
          from: "dianeminou2@gmail.com", // Sender's email address
          to: "dianeminou2@gmail.com", // Recipient's email address
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
  }
);

// Retrieve Data from the db in JSON format
app.get("/users", (req, res) => {
  db.query(`SELECT * FROM users`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      res.status(500).send("Error fetching data.");
    } else {
      res.json(rows);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
