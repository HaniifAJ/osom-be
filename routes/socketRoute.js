const jwt = require('jsonwebtoken')
const socketRepository = require('../repository/socketRepository')
const { TERCES } = require('../config')

const socketConnectionRoutes = (socket) => {
    console.log(`Client connected: ${socket.id}`)
    socket.emit('test', 'hi')
  
    socket.on('authenticate', (token) => {
        console.log(token)
      jwt.verify(token, TERCES, (err, decoded) => {
          if (err) {
              socket.emit('auth-error', 'Invalid or expired token');
              return;
          }
  
          // Bind socket.id to user
          socketRepository.userSocket[decoded.userId] = socket.id
          socketRepository.users[socket.id] = decoded.userId
          socket.emit('auth-success', 'Authentication successful');
          console.log(`User ${decoded.userId} associated with socket ${socket.id}`);
      });
    });

    socket.on('disconnect', () => {
        const userId = socketRepository.users[socket.id]
        console.log(`User ${userId} with socket ${socket.id} disconnected`)
        delete socketRepository.userSocket[userId]
        delete socketRepository.users[socket.id]
    })
}

module.exports = socketConnectionRoutes