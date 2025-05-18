const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const authenticateToken = require("../middleware/authMiddleware");

const db = new sqlite3.Database(process.env.DATABASE);

/**
 * POST /bookings – Gäst gör en bokning
 */
router.post("/bookings", (req, res) => {
    const { name, email, guests, date, time } = req.body;

    if (!name || !email || !guests || !date || !time) {
        return res.status(400).json({ error: "Alla fält krävs för att göra en bokning." });
    }
    const errors = [];

    if (!name) {
        errors.push("Du måste fylla i namn.");
    }

    if (!email) {
        errors.push("Du måste fylla i email.");
    }

    if(!guests) {
        errors.push("DU måste fylla i antal gäster.");
    }

    if(!date) {
        errors.push("Du måste fylla i datum.");
    }

    if(!date) {
        errors.push("Du måste fylla i tid.");
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }


    const sql = `
        INSERT INTO bookings (name, email, guests, date, time)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [name, email, guests, date, time];

    db.run(sql, values, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte spara bokningen." });
        }

        res.status(201).json({
            message: "Bokning skickad!",
            bookingId: this.lastID
        });
    });
});

/**
 * GET /bookings – Lista alla bokningar (endast admin)
 */
router.get("/bookings", authenticateToken, (req, res) => {
    db.all("SELECT * FROM bookings ORDER BY created DESC", (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte hämta bokningar." });
        }

        res.status(200).json(rows);
    });
});

/**
 * DELETE /bookings/:id – Radera en bokning (endast admin)
 */
router.delete("/bookings/:id", authenticateToken, (req, res) => {
    const id = req.params.id;

    db.run("DELETE FROM bookings WHERE id = ?", [id], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte radera bokningen." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Bokning hittades inte." });
        }

        res.status(200).json({ message: "Bokning raderad!" });
    });
});

module.exports = router;
