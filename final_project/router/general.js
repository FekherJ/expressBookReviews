const express = require('express');
let booksFilePath = "./booksdb.js"
let books = require(booksFilePath);
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  const userExists = Object.values(users).some(user => user.username == username)  // // Check if the username already exists

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (userExists){
    res.status(409).json({ message: "User already registered." });
  } else {
    const newUser = {
    username : username,
    password : password
    }
    users.push(newUser);
    return res.status(201).json({ message: "User successfully registered." });
  }
});

// Get the book list available in the shop (synchrounous) 
/*public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,6));   // you can also use res.json
});
*/

// Get the book list available in the shop (async-await with Axios)
public_users.get('/', async function (req, res) {
  try {
    // to fetch the book data from an external API:    const response = await axios.get('https://api.example.com/books');
    // res.json(response.data); // Send the book list as a JSON response
    res.json(books);  // Directly send the books data from the local file
  } catch (error) {
    res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});


// Get book details based on ISBN (synchrounous)
/*
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const results = Object.values(books).filter(book => book.isbn == isbn);

  if (results.length > 0 ) {
    res.send(books[isbn]);  
  } else{
    res.status(404).json ({ message: "No books found with this ISBN"});
  }
});*/

// Get book details based on ISBN (async-await with Axios)
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;

  try{
    const data = await fs.readFile(booksFilePath, 'utf-8');  // Read the books data from the file asynchronously
    const books = JSON.parse(data); // Parse the file data to JSON
    if (books[isbn]) {
      res.json(books[isbn]);
    } else{
      res.status(500).json ({ message: "No books found with this ISBN"});
    }   
  }catch(error){  
    res.status(500).json({ message: "Error reading book data", error: error.message });
  }
});


  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const author = req.params.author;

  try{
    const data = await fs.readFile(booksFilePath, 'utf-8');   //     When const response = await axios.get('https://api.example.com/books');
    const books = response.data;
    const results = books.filter(book => book.author == author);
    
    if (results.length > 0){
      res.send(results);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error){
    res.status(500).json({ message: "Error reading book data", error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;   // req.params is used to capture route parameters from the URL path (e.g., /login/:username)
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
    if (book.reviews && Object.keys(book.reviews).length > 0) {
      res.json(book.reviews);       // Return all reviews for the given ISBN
    } else {
      res.status(404).json({ message: "No reviews found for this ISBN" });
    } 
  } else {
    res.status(404).json({ message: "No books found with this ISBN" });
  }
});

module.exports.general = public_users;
