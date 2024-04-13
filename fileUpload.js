// Import necessary modules
const express = require('express');
const multer = require('multer');

// Create an instance of Express application
const app = express();

// Set up Multer middleware for handling file uploads
const upload = multer({ dest: 'uploads/' }); // Set the destination folder for uploaded files

// Define route for file upload
app.post('/upload', upload.single('file'), (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process the uploaded file (e.g., save it to the database)
    // Replace this with your file processing logic

    // Respond with a success message
    res.status(200).json({ message: 'File uploaded successfully' });
});

// Define route for fetching files
app.get('/files', (req, res) => {
    // Fetch files from the server (e.g., from the database)
    // Replace this with your file fetching logic

    // Example: Return a list of file names
    const files = ['file1.pdf', 'file2.jpg', 'file3.txt'];

    // Return the list of files to the client
    res.status(200).json({ files });
});

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
