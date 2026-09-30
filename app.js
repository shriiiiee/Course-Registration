const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "studentdb"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }

  console.log("Connected to MySQL database");

  const createTable = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      age INT NOT NULL,
      email VARCHAR(100) NOT NULL,
      course VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createTable, (err) => {
    if (err) {
      console.error("Table creation failed:", err.message);
    }
  });
});

app.get("/", (req, res) => {
  db.query("SELECT * FROM students ORDER BY id DESC", (err, students) => {
    if (err) {
      return res.render("index", {
        students: [],
        message: "Unable to fetch students"
      });
    }

    res.render("index", {
      students,
      message: null
    });
  });
});

app.post("/register", (req, res) => {
  const { name, age, email, course } = req.body;

  const sql = "INSERT INTO students (name, age, email, course) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, age, email, course], (err) => {
    if (err) {
      console.error("Insert failed:", err.message);
      return res.render("index", {
        students: [],
        message: "Registration failed. Please try again."
      });
    }

    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
