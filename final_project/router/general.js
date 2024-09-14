const express = require('express');
const books = require("./booksdb.js");  // Directly import the books object
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Simulate an async function that returns the local books
const fetchBooks = async () => {
  // Simulate asynchronous fetching of books (even though it's local)
  return new Promise((resolve) => {
    resolve(books);
  });
};

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

// Task 10: Get the book list using async/await
public_users.get('/', async function (req, res) {
  try {
    const booksData = await fetchBooks();  // Fetch books asynchronously
    return res.json({ message: "Books retrieved successfully", data: booksData });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const booksData = await fetchBooks();  // Fetch books asynchronously
    if (booksData[isbn]) {
      return res.json({ message: "Book retrieved successfully", data: booksData[isbn] });
    } else {
      return res.status(404).json({ message: "No books found with this ISBN" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Task 12: Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const booksData = await fetchBooks();  // Fetch books asynchronously
    const results = Object.values(booksData).filter(book => book.author === author);

    if (results.length > 0) {
      return res.json({ message: "Books retrieved successfully", data: results });
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Task 13: Get book details based on title using async/await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const booksData = await fetchBooks();  // Fetch books asynchronously
    const results = Object.values(booksData).filter(book => book.title === title);

    if (results.length > 0) {
      return res.json({ message: "Books retrieved successfully", data: results });
    } else {
      return res.status(404).json({ message: "No books found by this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Get book review by ISBN using async/await
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const booksData = await fetchBooks();  // Fetch books asynchronously
    const book = booksData[isbn];

    if (book) {
      if (book.reviews && Object.keys(book.reviews).length > 0) {
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
