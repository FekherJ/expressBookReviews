const express = require('express');
const books = require("./booksdb.js");  // Directly import the books object
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const userExists = users.some(user => user.username === username);  // Check if the username already exists

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (userExists) {
    return res.status(409).json({ message: "User already registered." });
  } else {
    const newUser = {
      username: username,
      password: password
    };
    users.push(newUser);
    return res.status(201).json({ message: "User successfully registered." });
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  try {
    return res.json({ message: "Books retrieved successfully", data: books });  // Directly send the books data from the object
  } catch (error) {
    res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(400).json({ message: "Invalid ISBN provided." });
  }
  try {
    if (books[isbn]) {
      return res.json({ message: "Book retrieved successfully", data: books[isbn] });
    } else {
      return res.status(404).json({ message: "No books found with this ISBN" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  try {
    const results = Object.values(books).filter(book => book.author === author);

    if (results.length > 0) {
      return res.json({ message: "Books retrieved successfully", data: results });
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  try {
    const results = Object.values(books).filter(book => book.title === title);

    if (results.length > 0) {
      return res.json({ message: "Books retrieved successfully", data: results });
    } else {
      return res.status(404).json({ message: "No books found by this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Get book review by ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(400).json({ message: "Invalid ISBN provided." });
  }
  try {
    const book = books[isbn];

    if (book) {
      if (book && book.reviews && Object.keys(book.reviews).length > 0) {
        return res.json({ message: "Reviews retrieved successfully", data: book.reviews });
      } else {
        return res.status(404).json({ message: "No reviews found for this ISBN" });
      }
    } else {
      return res.status(404).json({ message: "No books found with this ISBN" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book reviews", error: error.message });
  }
});

module.exports.general = public_users;
