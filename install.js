/**
 * Initierar SQLite-databasen och skapar alla nödvändiga tabeller.
 * 
 * Tabeller:
 * - users: Administratörsanvändare
 * - menu_items: Meny för maträtter och dryck
 * - tables: Tillgängliga bord i restaurangen
 * - bookings: Gästbokningar med namn, email, gäster, datum och tid
 * - messages: Kontaktformulärmeddelanden från besökare
 * 
 * OBS: Befintliga tabeller raderas och återskapas.
 * Skapar även admin
 */
// Import av paket
require("dotenv").config();
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Sätt upp databasens sökväg
const db = new sqlite3.Database(process.env.DATABASE);

// Aktivera foreign key-stöd direkt efter anslutning
db.run("PRAGMA foreign_keys = ON");

// Skapa tabeller om de inte redan finns
db.serialize(() => {
    // Ta bort befintliga tabeller om de finns
    db.run("DROP TABLE IF EXISTS users");
    db.run("DROP TABLE IF EXISTS menu_items");
    db.run("DROP TABLE IF EXISTS bookings");
    db.run("DROP TABLE IF EXISTS tables");
    db.run("DROP TABLE IF EXISTS messages");

    // Skapa tabeller
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Meny
    db.run(`CREATE TABLE menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL, 
        available BOOLEAN DEFAULT 1
    )`);

    // Bord
    db.run(`CREATE TABLE tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        seats INTEGER NOT NULL
    )`);

    // Bokningar
    db.run(`CREATE TABLE bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        guests INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        table_id INTEGER,
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (table_id) REFERENCES tables(id)
    )`);

    // Meddelanden från kontaktformulär
    db.run(`CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Skapa admin-användare om den inte redan finns
    const username = "admin";
    const password = process.env.ADMIN_PASSWORD; // Hämtar lösenordet från .env

    // Kolla om admin-användaren finns
    db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return console.error(err.message);

        // Om användaren inte finns, skapa den
        if (!row) {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) return console.error(err);
                db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function (err) {
                    if (err) return console.error(err.message);
                    console.log("Admin användare skapad.");
                });
            });
        } else {
            console.log("Admin användare finns redan.");
        }
    });

    console.log("Alla tabeller skapades och admin kontrollerades.");
});