const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const adminFilePath = path.join(__dirname, '../admin.json');
let admins = JSON.parse(fs.readFileSync(adminFilePath, 'utf-8') || '[]');
const ADMIN_SECRET = "superAdminSecretKey456!";

const saveAdminData = () => fs.writeFileSync(adminFilePath, JSON.stringify(admins, null, 2), 'utf-8');

exports.promoteUserToAdmin = async (req, res) => {
    const { token, email } = req.body;

    try {
        const decoded = jwt.verify(token, ADMIN_SECRET);
        const requestingAdmin = admins.find(admin => admin.id === decoded.id);

        if (!requestingAdmin) return res.status(403).send('Unauthorized: Only admins can promote new admins');

        let users = JSON.parse(fs.readFileSync(path.join(__dirname, '../users.json'), 'utf-8'));
        const userToPromote = users.find(user => user.email === email);
        if (!userToPromote) return res.status(404).send('User not found');

        users = users.filter(user => user.email !== email);
        admins.push(userToPromote);
        fs.writeFileSync(path.join(__dirname, '../users.json'), JSON.stringify(users, null, 2), 'utf-8');
        saveAdminData();
        res.status(200).send('User promoted to admin');
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};
