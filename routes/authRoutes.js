// Importerar alla paket
const express = require ("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Anslut till databasen
const db = new sqlite3.Database(process.env.DATABASE);

// Logga in admin
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validera input
        if(!username || !password) {
            return res.status(400).json({ error: "Ogiltig input, fyll i både användarnamn och lösenord"});
        }

        // Kolla om användaren finns
        const sql = `SELECT * FROM users WHERE username=?`;
        db.get(sql, [username], async (err, row) => {
            if(err) {
                res.status(400).json({message: "Error med autentisering..."});
                // Användaren finns inte
            } else if (!row) {
                res.status(401).json({message: "Felaktigt användarnamn eller lösenord"});
            } else {
                // Kolla om lösenordet stämmer
                const passwordMatch = await bcrypt.compare(password, row.password);
                if (!passwordMatch) {
                    res.status(401).json({ message: "Felaktigt användarnamn eller lösenord"});
                } else {
                    // Skapa webtoken
                    const payload = { username: username };
                    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '5h'});
                    const response = {
                        message: "Användare inloggad!",
                        token: token
                    }
                    res.status(200).json({ response });
                }
            }
        });

    } catch {
        res.status(500).json({ error: "Server error"});
    }
});

module.exports = router;