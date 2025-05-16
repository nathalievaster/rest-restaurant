const jwt = require("jsonwebtoken");

// Validera token
function authenticateToken(req, res, next) { 
    const authHeader = req.headers ['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) res.status(401).json ({ message: "Du har ingen tillgång till denna route pga saknad token!"});
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if(err) return res.status(403).json({ message: "Ogiltig token."});

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;