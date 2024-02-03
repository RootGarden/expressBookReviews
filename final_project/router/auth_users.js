const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return username && typeof username === 'string' && !username.includes(' ');
};

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    // Assuming users' passwords are stored in plain text (which is not recommended)
    return user && user.password === password;
};

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!isValid(username) || !password) {
        return res.status(400).json({ message: "Invalid username or password." });
    }

    if (authenticatedUser(username, password)) {
        // Create JWT token
        const token = jwt.sign({ username }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
        // Store username in session
        req.session.username = username;
        return res.status(200).json({ token, message: "Login successful" });
    } else {
        return res.status(401).json({ message: "Authentication failed." });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    if (!req.session || !req.session.username) {
        return res.status(403).json({ message: "Unauthorized access. Please log in." });
    }

    const { isbn } = req.params;
    const { review } = req.query.review;
    const username = req.session.username;

    const book = Object.values(books).find(book => book.isbn === isbn);
    if (book) {
        // Add or update the review
        book.reviews[username] = review;
        return res.status(200).json({ message: "Review updated successfully." });
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Check if the user is logged in by verifying session username
    if (!req.session || !req.session.username) {
        return res.status(403).json({ message: "Unauthorized access. Please log in." });
    }

    const { isbn } = req.params;
    const username = req.session.username; // Extract username from session

    // Find the book by ISBN
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (book) {
        // Check if the user has posted a review for this book
        if (book.reviews.hasOwnProperty(username)) {
            // Delete the user's review
            delete book.reviews[username];
            return res.status(200).json({ message: "Review deleted successfully." });
        } else {
            // No review by the user to delete
            return res.status(404).json({ message: "Review not found." });
        }
    } else {
        // Book not found
        return res.status(404).json({ message: "Book not found." });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
