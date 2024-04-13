const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: String,
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' } // Reference to file
});

module.exports = mongoose.model('Comment', commentSchema);
