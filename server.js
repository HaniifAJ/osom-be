const express = require('express');
const router = require('./routes');
const { PORT, SOCKET_PORT } = require('./config')
const http = require('http')
const { Server } = require('socket.io');

const app = express()

const server = http.createServer(app);
const io = new Server(server);
app.set('socketio', io)

const socketConnectionRoutes = require('./routes/socketRoute')
io.on('connection', (socket) => socketConnectionRoutes(socket));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/v1', router)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.listen(SOCKET_PORT, () => {
  console.log(`Socket server listening on http://localhost:${SOCKET_PORT}`)
})
