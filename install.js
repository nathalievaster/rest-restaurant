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
 */
// Import av paket
require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(process.env.DATABASE);

// Skapa alla tabeller
db.serialize(() => {
    // Ta bort befintliga tabeller om de finns
    db.run("DROP TABLE IF EXISTS users");
    db.run("DROP TABLE IF EXISTS menu_items");
    db.run("DROP TABLE IF EXISTS bookings");
    db.run("DROP TABLE IF EXISTS tables");
    db.run("DROP TABLE IF EXISTS messages");

    // Användare (admin)
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
        created DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Meddelanden från kontaktformulär
    db.run(`CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log("Alla tabeller skapade!");
});