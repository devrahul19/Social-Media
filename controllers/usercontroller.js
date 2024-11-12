const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userFilePath = path.join(__dirname, '../users.json');
let users = JSON.parse(fs.readFileSync(userFilePath, 'utf-8') || '[]');
const JWT_SECRET = "superSecretJWTKey123!";

const saveData = () => fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2), 'utf-8');

exports.registerUser = async (req, res) => {
    const { email, password, public } = req.body;
    if (!email || !password || public === undefined) return res.status(400).send('Please provide all details');

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
        public // Setting profile visibility during registration
    };
    users.push(newUser);
    saveData();
    
    return res.status(201).send('User registered successfully');
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    let user = users.find(user => user.email === email);

    if (!user) return res.status(400).send('User not found');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).send('Invalid password');

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};

// Update Profile Visibility Endpoint
exports.updateProfileVisibility = (req, res) => {
    const { token, public } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const user = users.find(u => u.id === userId);
        if (!user) return res.status(404).send('User not found');

        user.public = public;
        saveData();
        res.status(200).send(`Profile visibility updated to ${public ? 'public' : 'private'}`);
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};

exports.getProfile = (req, res) => {
    const { token } = req.body;
    const userIdToView = parseInt(req.params.id, 10);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const userToView = users.find(u => u.id === userIdToView);
        if (!userToView) return res.status(404).send('User not found');

        const isFollowing = followers.some(f => f.userId === userIdToView && f.followerId === userId);
        if (!userToView.public && !isFollowing && userToView.id !== userId) {
            return res.status(403).send('This profile is private');
        }

        res.status(200).json({
            id: userToView.id,
            email: userToView.email,
            public: userToView.public
        });
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};
