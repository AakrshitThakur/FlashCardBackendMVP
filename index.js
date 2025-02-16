// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating and verifying JWT tokens
const cors = require("cors"); // For enabling CORS
require("dotenv").config(); // Load environment variables from .env file

console.log(process.env.MONGO_URI);

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Define server port and MongoDB URI from environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = `mongodb+srv://thakurraakrshitt:${encodeURIComponent(
  process.env.AakrshitThakurUSER_PSD
)}@cluster0.j79ec.mongodb.net/FlashCardMVP_DB?retryWrites=true&w=majority&appName=Cluster0`;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected")) // Log success message on connection
  .catch((err) => console.log(err)); // Log error if connection fails

// Define User Schema for MongoDB
const userSchema = new mongoose.Schema({
  username: String, // Username field
  password: String, // Password field (will be hashed)
});

// Create User model from the schema
const User = mongoose.model("User", userSchema);

// Define Flashcard Schema for MongoDB
const flashcardSchema = new mongoose.Schema({
  question: String, // Question field
  answer: String, // Answer field
  box: { type: Number, default: 1 }, // Box number for spaced repetition (default is 1)
  nextReviewDate: { type: Date, default: Date.now }, // Next review date (default is current date)
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the User who owns the flashcard
});

// Create Flashcard model from the schema
const Flashcard = mongoose.model("Flashcard", flashcardSchema);

// Middleware to authenticate JWT tokens
const auth = (req, res, next) => {
  const token = req.header("x-auth-token"); // Get token from request header
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" }); // Deny access if no token is provided

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded.user; // Attach the decoded user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Token is not valid" }); // Deny access if token is invalid
  }
};

// Routes

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body
  try {
    let user = await User.findOne({ username }); // Check if user already exists
    if (user) return res.status(400).json({ msg: "User already exists" }); // Return error if user exists

    user = new User({ username, password }); // Create a new user instance
    const salt = await bcrypt.genSalt(10); // Generate a salt for password hashing
    user.password = await bcrypt.hash(password, salt); // Hash the password
    await user.save(); // Save the user to the database

    const payload = { user: { id: user.id } }; // Create payload for JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Return the generated token
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error"); // Handle server errors
  }
});

// Login an existing user
app.post("/login", async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body
  try {
    let user = await User.findOne({ username }); // Find user by username
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" }); // Return error if user does not exist

    const isMatch = await bcrypt.compare(password, user.password); // Compare provided password with hashed password
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" }); // Return error if passwords do not match

    const payload = { user: { id: user.id } }; // Create payload for JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Return the generated token
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error"); // Handle server errors
  }
});

// Add a new flashcard (protected route)
app.post("/flashcards", auth, async (req, res) => {
  const { question, answer } = req.body; // Extract question and answer from request body
  try {
    const newFlashcard = new Flashcard({ question, answer, user: req.user.id }); // Create a new flashcard instance
    await newFlashcard.save(); // Save the flashcard to the database
    res.json(newFlashcard); // Return the saved flashcard
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error"); // Handle server errors
  }
});

// Get all flashcards for the authenticated user (protected route)
app.get("/flashcards", auth, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user: req.user.id }); // Find all flashcards for the user
    res.json(flashcards); // Return the flashcards
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error"); // Handle server errors
  }
});

// Get flashcard for the authenticated user (protected route)
app.get("/flashcards/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const flashcard = await Flashcard.findById(id); // Finding a flashcard
    res.json(flashcard); // Return the flashcard
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error"); // Handle server errors
  }
});

// Update a flashcard (protected route)
app.put("/flashcards/:id", auth, async (req, res) => {
  const { id } = req.params; // Extract flashcard ID from URL parameters
  const { correct } = req.body; // Extract correctness flag from request body
  const { question, answer } = req.body;
  try {
    const flashcard = await Flashcard.findByIdAndUpdate(
      id,
      { question, answer },
      { new: true } // Return the updated document
    );
    // const flashcard = await Flashcard.findById(id); // Find the flashcard by ID
    if (!flashcard) return res.status(404).json({ msg: "Flashcard not found" }); // Return error if flashcard is not found

    // Update the flashcard's box and next review date based on correctness
    if (correct) {
      flashcard.box += 1; // Move to the next box if the answer is correct
    } else {
      flashcard.box = 1; // Reset to box 1 if the answer is incorrect
    }
    flashcard.nextReviewDate = new Date(
      Date.now() + flashcard.box * 24 * 60 * 60 * 1000
    ); // Set the next review date
    await flashcard.save(); // Save the updated flashcard
    res.json(flashcard); // Return the updated flashcard
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error"); // Handle server errors
  }
});

// Delete a flashcard (protected route)
app.delete("/flashcards/:id", auth, async (req, res) => {
  const { id } = req.params; // Extract flashcard ID from URL parameters
  try {
    await Flashcard.findByIdAndDelete(id); // Delete the flashcard by ID
    res.json({ msg: "Flashcard deleted" }); // Return success message
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error"); // Handle server errors
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
