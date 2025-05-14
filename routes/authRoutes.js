const express = require ("express");
const router = express.Router();


// Logga in admin
router.post("/login", async (req, res) => {
    console.log ("login called...");
});