const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const authenticateToken = require("../middleware/authMiddleware");

// Anslut till databasen
const db = new sqlite3.Database(process.env.DATABASE);

/**
 * POST – Skicka ett meddelande från kontaktformulär
 * Öppen för alla (ingen token krävs)
 */
router.post("/messages", (req, res) => {
    const { name, email, message } = req.body;

    // Lagra alla felmeddelanden vid saknas input i en array för tydligt gränssnitt
    const errors = [];

    if(!name) {
        errors.push("Du måste fylla i användarnamn.")
    }

    if(!email) {
        errors.push("Du måste fylla i email.");
    }

    if(!message) {
        errors.push("Du måste fylla i ett meddelande.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const sql = `INSERT INTO messages (name, email, message) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, message], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte skicka meddelandet." });
        }

        res.status(201).json({ message: "Meddelandet har skickats!", messageId: this.lastID });
    });
});

module.exports = router;