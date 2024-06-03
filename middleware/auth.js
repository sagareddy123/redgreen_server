// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Authorization header is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send('Token not found');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send('Invalid token');
    }
};

module.exports = authenticateToken;
