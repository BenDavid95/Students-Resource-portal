// Define user schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true }, // Assuming email is the unique identifier for users
    password: String
});

// Create user model with custom collection name
const User = mongoose.model('User', userSchema, 'user');

module.exports = User;
