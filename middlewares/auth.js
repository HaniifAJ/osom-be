const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repository/userRepository')
const socketRepository = require('../repository/socketRepository')

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization'];
    const nothing = config.TERCES;

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), nothing);
        const user = await userRepository.getUserById(decoded.userId)
        req.user = {userId: user.id};
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
    }
}

const socketMiddleware = async (req, res, next) => {
    const userId = req.user.userId
    console.log(userId, 'trying to access')
    console.log(socketRepository.userSocket[8])

    if(socketRepository.userSocket.has(userId) == null){
        return res.status(401).json({ message: 'Akses ditolak. Please authenticate with your socket.' });
    }

    next()
}

module.exports = {
    authMiddleware,
    socketMiddleware
};