const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const authenticateToken = require("../middleware/authMiddleware"); // Importera skydd

const db = new sqlite3.Database(process.env.DATABASE);

/**
 * Lägg till menyobjekt – endast för inloggad admin (JWT-skyddat)
 */
router.post("/menu", authenticateToken, (req, res) => {
    const { name, description, price, category, available } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: "Namn, pris och kategori krävs." });
    }

    const sql = `
        INSERT INTO menu_items (name, description, price, category, available)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        description || null,
        price,
        category,
        available !== undefined ? available : 1
    ];

    db.run(sql, values, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte lägga till menyobjekt." });
        }

        res.status(201).json({
            message: "Menyobjekt tillagt!",
            menuItemId: this.lastID
        });
    });
});

module.exports = router;