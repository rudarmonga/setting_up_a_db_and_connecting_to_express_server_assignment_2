const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { resolve } = require('path');
const User = require('./schema'); // Make sure this matches the file name where your schema is defined
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

console.log("🔍 MongoDB URI from .env:", process.env.MONGO_URI); // Debugging log

const app = express();
const port = 3010;

// MongoDB connection setup
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
  } catch (error) {
    console.error(`❌ Error connecting to database: ${error.message}`);
    process.exit(1); // Exit process if database connection fails
  }
};

// Call the function to connect to MongoDB
connectDB();

app.use(express.static('static'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// POST route to register a user
// ✅ POST route to register user
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
