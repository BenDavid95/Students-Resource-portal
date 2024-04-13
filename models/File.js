const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: String,
    description: String,
    date: Date,
    path: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] // Reference to comments
});

module.exports = mongoose.model('File', fileSchema);
