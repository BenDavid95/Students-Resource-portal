// Import necessary modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const File = require('./models/File'); // Import mongoose file model
const Comment = require('./models/Comment'); // Import mongoose comment model
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_resource_portal';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define user schema
const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String
});

// Create user model
const User = mongoose.model('User', userSchema);

// Set up Multer middleware for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        // Check if password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send('Invalid email or password');
        }

        // If login successful, redirect to home.html
        res.redirect('/home.html');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        
        // Save the user to the database
        await newUser.save();

        // Redirect to login page after successful signup
        res.redirect('/');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Define route for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { originalname, notesDescription, notesDate } = req.file;
        
        // Save file metadata to the database
        const file = new File({
            filename: originalname,
            description: notesDescription,
            date: notesDate,
            path: req.file.path // Assuming multer saves the file to the 'uploads/' directory
        });
        await file.save();
        
        res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Define route for fetching files
app.get('/files', async (req, res) => {
    try {
        // Fetch all files from the database
        const files = await File.find();
        res.status(200).json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Define route for downloading a file
app.get('/download/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }
        const filePath = path.join(__dirname, file.path);
        res.download(filePath, file.filename);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Define route for adding comments to a file
app.post('/files/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        
        // Find the file by its ID
        const file = await File.findById(id);
        
        // Save comment to the database
        const comment = new Comment({ text });
        file.comments.push(comment);
        await file.save();
        
        res.status(200).json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Define route for retrieving comments of a file
app.get('/files/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the file by its ID and populate its comments
        const file = await File.findById(id).populate('comments');
        
        res.status(200).json(file.comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
