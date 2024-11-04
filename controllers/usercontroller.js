const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userFilePath = path.join(__dirname, '../users.json');
let users = JSON.parse(fs.readFileSync(userFilePath, 'utf-8') || '[]');
const JWT_SECRET = "superSecretJWTKey123!";

const saveData = () => fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2), 'utf-8');

exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Please provide all details');

    const existingUser = users.find(user => user.email === email);
    if (existingUser) return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, email, password: hashedPassword, registered: true };
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

    const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};
