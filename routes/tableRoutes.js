const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const authenticateToken = require("../middleware/authMiddleware");

const db = new sqlite3.Database(process.env.DATABASE);

/**
 * GET /tables – Hämta alla bord 
 * Endast admin
 */
router.get("/tables", authenticateToken, (req, res) => {
    db.all("SELECT * FROM tables", (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte hämta bord." });
        }
        res.status(200).json(rows);
    });
});

/**
 * POST /tables – Skapa nytt bord 
 * Endast admin
 */
router.post("/tables", authenticateToken, (req, res) => {
    const { name, seats } = req.body;

    const errors = [];

    if (!name) {
        errors.push("Du måste fylla i bordets namn.");
    }

    if (!seats) {
        errors.push("Du måste fylla i antal sittplatser.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const sql = `INSERT INTO tables (name, seats) VALUES (?, ?)`;
    db.run(sql, [name, seats], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte skapa bord." });
        }
        res.status(201).json({ message: "Bord skapat!", tableId: this.lastID });
    });
});

/**
 * PUT /tables/:id – Uppdatera bord
 * Endast admin
 */
router.put("/tables/:id", authenticateToken, (req, res) => {
    const { name, seats } = req.body;
    const id = req.params.id;

    if (!name && !seats) {
        return res.status(400).json({ error: "Minst ett fält (namn eller platser) krävs." });
    }

    const fields = [];
    const values = [];

    if (name) {
        fields.push("name = ?");
        values.push(name);
    }

    if (seats) {
        fields.push("seats = ?");
        values.push(seats);
    }

    values.push(id);

    const sql = `UPDATE tables SET ${fields.join(", ")} WHERE id = ?`;
    db.run(sql, values, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte uppdatera bord." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Bord hittades inte." });
        }

        res.status(200).json({ message: "Bord uppdaterat!" });
    });
});

/**
 * DELETE /tables/:id – Radera bord 
 * Endast admin
 */
router.delete("/tables/:id", authenticateToken, (req, res) => {
    const id = req.params.id;

    db.run("DELETE FROM tables WHERE id = ?", [id], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte radera bord." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Bord hittades inte." });
        }

        res.status(200).json({ message: "Bord raderat!" });
    });
});

module.exports = router;
