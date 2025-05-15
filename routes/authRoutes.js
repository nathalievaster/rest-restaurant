const express = require ("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();


// Logga in admin
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validera input
        if(!username || !password) {
            return res.status(400).json({ error: "Ogiltig input, fyll i både användarnamn och lösenord"});
        }

        // Kolla om det är rätt
        
    } catch {
        res.status(500).json({ error: "Server error"});
    }
});

module.exports = router;