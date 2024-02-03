const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Registration route
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required."});
    }

    // Check if the username is valid
    if (!isValid(username)) {
        return res.status(400).json({message: "Invalid username."});
    }

    // Check if the user already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({message: "Username is already taken."});
    }

    // Add the new user to the users array
    users.push({
        username,
        password,
    });

    // Respond with success
    return res.status(201).json({message: "User registered successfully."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const fetchBooks = async () => {
            if (Object.keys(books).length > 0) {
                return books; // Return the books object if not empty
            } else {
                throw new Error("No books available"); // Throw an error if no books
            }
        };

        const booksData = await fetchBooks();
        res.status(200).json(booksData); // Send the books data as JSON
    } catch (error) {
        // Catch and respond with an error if no books are found
        res.status(404).json({ message: error.message });
    }
});


// Get book details based on ISBN
public_users.get('/', async function (req, res) {
    const getBooks = async () => {
        return new Promise((resolve, reject) => {
            if (Object.keys(books).length > 0) {
                resolve(books); // Resolve the promise with the books data
            } else {
                reject(new Error("No books available")); // Reject the promise if no books are found
            }
        });
    };

    try {
        const booksData = await getBooks(); // Await the resolution of the getBooks promise
        res.status(200).json(booksData); // Send the books data as JSON if the promise is resolved
    } catch (error) {
        res.status(404).json({ message: error.message }); // Send an error message if the promise is rejected
    }
});

  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const fetchBooksByAuthor = async (author) => {
        return new Promise((resolve, reject) => {
            // Decode URI component to handle special characters in author names
            const decodedAuthor = decodeURIComponent(author);
            
            // Filter books to find those written by the specified author
            const booksByAuthor = Object.values(books).filter(book => book.author === decodedAuthor);

            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor); // Resolve the promise with the found books
            } else {
                reject(new Error("No books found by this author")); // Reject the promise if no books found
            }
        });
    };

    try {
        const author = req.params.author;
        const booksByAuthor = await fetchBooksByAuthor(author); // Await the async fetch operation
        res.status(200).json(booksByAuthor); // If books are found, return their details
    } catch (error) {
        res.status(404).json({ message: error.message }); // If no books are found, return a not found message
    }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const fetchBooksByTitle = async (title) => {
        return new Promise((resolve, reject) => {
            // Decode URI component to handle special characters in titles
            const titleSearch = decodeURIComponent(title).toLowerCase();

            // Filter books to find those that match the specified title
            const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(titleSearch));

            if (booksByTitle.length > 0) {
                resolve(booksByTitle); // Resolve with the found books
            } else {
                reject(new Error("No books found with this title")); // Reject if no books found
            }
        });
    };

    try {
        const title = req.params.title;
        const booksByTitle = await fetchBooksByTitle(title); // Await the async fetch operation
        res.status(200).json(booksByTitle); // Send the found books as JSON
    } catch (error) {
        res.status(404).json({ message: error.message }); // Send error message if no books are found
    }
});


// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    // Extract the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Find the book by its ISBN
    const book = Object.values(books).find(book => book.isbn.toString() === isbn);

    if (book) {
        // If the book is found, return its reviews
        return res.status(200).json(book.reviews);
    } else {
        // If no book is found with the given ISBN, return a not found message
        return res.status(404).json({ message: "Book not found or no reviews available for this ISBN" });
    }
});


module.exports.general = public_users;
