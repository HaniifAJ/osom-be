const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repository/userRepository')

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization'];
    const nothing = config.TERCES;

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), nothing);
        const user = await userRepository.getUserById(decoded.userId)
        req.user = {userId: user.id, userData: user};
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
    }
}

module.exports = authMiddleware;