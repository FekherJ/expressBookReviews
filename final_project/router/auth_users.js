const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//check if the username is valid
  return Object.values(users).some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//check if username and password match the one we have in records.
  return Object.values(users).some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {    // user /customer/login
  const {username, password} = req.body;
  // Check if the user is already logged in
  if (req.session.authorization){
    return res.status(403).json({message: "You are already logged in."})
  }
  // Check if both username and password are provided
  if (!username || !password){
    return res.status(200).json({ message: "username and password are required to login." });
  }

  if (authenticatedUser (username, password)){
    //req.session.username = username;
    let token = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });
    req.session.authorization = { accessToken: token };  // Store the JWT in session
    console.log(req.session.authorization);


    return res.status(200).json({message: "Login successful."});
  } else {
    return res.status(401).json({ message: "Invalid username or password."});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const newReview = req.body.review;
  
  
  // Check if the user is authenticated by verifying the JWT token
  if (!req.session.authorization){
    return res.status(401).json({ message: "Please login in order to add/update books."});
  }

  let token = req.session.authorization['accessToken'];
  
  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token. Please log in again." });
    }

    const username = user.username;  // Extract username from decoded token

    // check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "The book was not found."});
    }
  
    // If the book exists, check if the user has already posted a review
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    } 

    // Check if the user has already posted a review
    if (books[isbn].reviews[username]){
      books[isbn].reviews[username] = newReview;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // If the user has not posted a review, add it
      books[isbn].reviews[username] = newReview;
      return res.status(201).json({ message: "Review added successfully" });
    }

})});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Log the session to see if the token is present
  console.log("Session authorization:", req.session.authorization);

  // Check if the user is authenticated by verifying the JWT token
  if (!req.session.authorization) {
    return res.status(401).json({ message: "Please login in order to delete reviews." });
  }

  let token = req.session.authorization['accessToken'];

  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token. Please log in again." });
    }

    const username = user.username;  // Extract username from decoded token

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "The book was not found." });
    }

    // Check if the book has reviews
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "No review found for this book from the logged-in user." });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

