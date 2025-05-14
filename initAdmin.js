// Skapar en admin
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("restaurant.db");
require("dotenv").config();

const username = "admin";
const password = process.env.ADMIN_PASSWORD;

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function (err) {
    if (err) return console.error(err.message);
    console.log("Admin skapad");
  });
});
