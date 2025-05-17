const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const authenticateToken = require("../middleware/authMiddleware"); // Importera skydd

const db = new sqlite3.Database(process.env.DATABASE);

/**
 * GET – Hämta alla menyobjekt
 */
router.get("/menu", (req, res) => {
    db.all("SELECT * FROM menu_items", (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte hämta menyobjekt." });
        }
        res.status(200).json(rows);
    });
});

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


/**
 * PUT – Uppdatera menyobjekt via ID
 */
router.put("/menu/:id", authenticateToken, (req, res) => {
    const id = req.params.id;
    const { name, description, price, category, available } = req.body;

    // Bygg uppdateringsdelarna dynamiskt, skapa två tomma listor. Fields för vilka fält som ska uppdateras, values för värdet
    const fields = [];
    const values = [];

    if (name !== undefined) {
        fields.push("name = ?");
        values.push(name);
    }

    if (description !== undefined) {
        fields.push("description = ?");
        values.push(description);
    }

    if (price !== undefined) {
        fields.push("price = ?");
        values.push(price);
    }

    if (category !== undefined) {
        fields.push("category = ?");
        values.push(category);
    }

    if (available !== undefined) {
        fields.push("available = ?");
        values.push(available);
    }

    // Om inget skickas in
    if (fields.length === 0) {
        return res.status(400).json({ error: "Inga giltiga fält att uppdatera." });
    }

    // Lägg till ID som sista värde för WHERE-klausul
    const sql = `UPDATE menu_items SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    db.run(sql, values, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Kunde inte uppdatera menyobjekt." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Menyobjekt hittades inte." });
        }

        res.status(200).json({ message: "Menyobjekt uppdaterat!" });
    });
});

module.exports = router;