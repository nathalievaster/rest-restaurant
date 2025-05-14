const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

// Routes
app.use("/api", authRoutes);

app.listen(port, () => {
    console.log(`Servern körs på http://localhost:${port}`);
});