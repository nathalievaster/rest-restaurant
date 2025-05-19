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
    const errors = [];

    if (!name) {
        errors.push("Du måste fylla i namn.");
    }

    if (!email) {
        errors.push("Du måste fylla i email.");
    }

    if (!guests) {
        errors.push("DU måste fylla i antal gäster.");
    }

    if (!date) {
        errors.push("Du måste fylla i datum.");
    }

    if (!date) {
        errors.push("Du måste fylla i tid.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // 1. Hitta ledigt bord
    const tableSql = `
        SELECT id, seats FROM tables
        WHERE id NOT IN (
        SELECT table_id FROM bookings WHERE date = ? AND time = ?
        ) AND seats >= ?
        ORDER BY seats ASC
        LIMIT 1
    `;

    db.get(tableSql, [date, time, guests], (err, table) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte hämta bord." });
        }

        if (!table) {
            return res.status(400).json({ message: "Inga lediga bord för vald tid och antal gäster." });
        }

        // 2. Spara bokningen med kopplat bord
        const insertSql = `
            INSERT INTO bookings (name, email, guests, date, time, table_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [name, email, guests, date, time, table.id];

        db.run(insertSql, values, function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Kunde inte spara bokningen." });
            }

            res.status(201).json({
                message: "Bokning skapad!",
                bookingId: this.lastID,
                assignedTable: table.id
            });
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
