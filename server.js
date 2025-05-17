const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const messagesRoutes = require("./routes/messagesRoutes");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", menuRoutes);
app.use("/api", messagesRoutes);

// Skyddad admin-sida
app.get("/api/editmenu", authenticteToken, (req, res) => {
    res.json({ message: "Endast för admins!" });
});

// Validera token
function authenticteToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) res.status(401).json({ message: "Behörighet saknas för denna sida!"});

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, username) => {
        if(err) return res.status(403).json({ message: "Ogiltig JWT" });

        req.username = username;
        next();
    });
}

app.listen(port, () => {
    console.log(`Servern körs på http://localhost:${port}`);
});