const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const userName = req.body.userName;
  const password = req.body.password;
  const userExists = Object.values(users).some(user => user.userName == userName)  // // Check if the username already exists

  if (!userName || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (userExists){
    res.status(409).json({ message: "User already registered." });
  } else {
    const newUser = {
    userName : userName,
    password : password
    }
    users.push(newUser);
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,6));   // you can also use res.json
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const results = Object.values(books).filter(book => book.isbn == isbn);

  if (results.length > 0 ) {
    res.send(books[isbn]);  
  } else{
    res.status(404).json ({ message: "No books found with this ISBN"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const results = Object.values(books).filter(book => book.author == author);
  
  if (results.length > 0){
    res.send(results);
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const results = Object.values(books).filter(book => book.title == title);

  if (results.length > 0){
    res.send(results);
  } else {
    res.status(404).json({ message: "No books found by this title" });
  }
});

//  Get book review by isbn
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];  

  if (book){
    if (book.reviews && book.reviews.length > 0) {
      res.json(book.reviews);
    } else {
      res.status(404).json({ message: "No reviews found for this ISBN" });
    } 
  } else {
    res.status(404).json({ message: "No books found with this ISBN" });
  }
});

module.exports.general = public_users;
