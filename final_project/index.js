const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configure session middleware for customer routes
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// JWT authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (token == null) return res.sendStatus(401); // If no token is present, unauthorized

    // Verify the token
    jwt.verify(token, 'YOUR_SECRET_KEY', (err, user) => {
        if (err) return res.sendStatus(403).json({message: "failed in index"}); // Forbidden if token is invalid
        req.user = user; // If token is valid, proceed
        next();
    });
});

const PORT = 5000;

// Route configurations
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log("Server is running"));
