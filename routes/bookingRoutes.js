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

    // Kontrollera öppettider
    const bookingDate = new Date(`${date}T${time}`);
    const day = bookingDate.getDay(); // 0 = söndag, ..., 6 = lördag
    const hour = bookingDate.getHours();
    const minute = bookingDate.getMinutes();
    const totalMinutes = hour * 60 + minute;

    let isOpen = false;

    if (day >= 0 && day <= 4) {
        // Sön–Tors: 11:00–22:00
        if (totalMinutes >= 11 * 60 && totalMinutes <= 22 * 60) {
            isOpen = true;
        }
    } else if (day === 5 || day === 6) {
        // Fre–Lör: 12:00–sent (tolkat som till 23:59)
        if (totalMinutes >= 12 * 60 && totalMinutes <= 23 * 60 + 59) {
            isOpen = true;
        }
    }

    if (!isOpen) {
        return res.status(400).json({
            message: "Bokningen måste ske under restaurangens öppettider."
        });
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
    const now = new Date().toISOString(); // ISO-format: "2025-06-02T15:45:00.000Z"
    const currentDate = now.slice(0, 10); // "2025-06-02"
    const currentTime = now.slice(11, 16); // "15:45"

    const sql = `
        SELECT * FROM bookings
        WHERE (date > ? OR (date = ? AND time > ?))
        ORDER BY date ASC, time ASC
    `;

    db.all(sql, [currentDate, currentDate, currentTime], (err, rows) => {
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

/**
 * PUT /bookings/:id – Uppdatera en bokning (endast admin)
 */
router.put("/bookings/:id", authenticateToken, (req, res) => {
    const id = req.params.id;
    const { name, email, guests, date, time } = req.body;
    const errors = [];

    if (!name) errors.push("Namn saknas.");
    if (!email) errors.push("Email saknas.");
    if (!guests) errors.push("Antal gäster saknas.");
    if (!date) errors.push("Datum saknas.");
    if (!time) errors.push("Tid saknas.");

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const sql = `
        UPDATE bookings
        SET name = ?, email = ?, guests = ?, date = ?, time = ?
        WHERE id = ?
    `;
    const params = [name, email, guests, date, time, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte uppdatera bokningen." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Bokning hittades inte." });
        }

        res.status(200).json({ message: "Bokning uppdaterad!" });
    });
});

module.exports = router;
