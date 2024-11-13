const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userFilePath = path.join(__dirname, '../users.json');
let users = JSON.parse(fs.readFileSync(userFilePath, 'utf-8') || '[]');
const JWT_SECRET = "superSecretJWTKey123!";

// Helper function to save user data to users.json
const saveData = () => fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2), 'utf-8');

// Register user function
exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Please provide all details');

    const existingUser = users.find(user => user.email === email);
    if (existingUser) return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = users.length === 0 ? 'admin' : 'user';

    const newUser = { 
        id: users.length + 1, 
        email, 
        password: hashedPassword, 
        registered: true, 
        role, 
        followers: [],
        following: [],
        private: false,
        followRequests: []
    };
    users.push(newUser);
    saveData();
    
    return res.status(201).send('User registered successfully');
};

// Login user function
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    let user = users.find(user => user.email === email);

    if (!user) return res.status(400).send('User not found');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).send('Invalid password');

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};

// Update user privacy settings
exports.updatePrivacy = (req, res) => {
    const { private } = req.body;
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).send('User not found');

    user.private = private;
    saveData();
    return res.status(200).send('Privacy setting updated');
};

// Get user profile with follow check
exports.getProfile = (req, res) => {
    const userIdToView = parseInt(req.params.id, 10);
    const userToView = users.find(u => u.id === userIdToView);

    if (!userToView) return res.status(404).send('User not found');

    if (userToView.private && userToView.id !== req.user.id && !userToView.followers.includes(req.user.id)) {
        return res.status(403).send('This profile is private');
    }

    res.status(200).json({
        id: userToView.id,
        email: userToView.email,
        public: !userToView.private
    });
};
