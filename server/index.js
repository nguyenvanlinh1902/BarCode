const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const sessions = new Map();

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('register-printer', (sessionId) => {
    sessions.set(sessionId, socket.id);
    console.log(`Printer registered with session: ${sessionId}`);
  });

  socket.on('scan-request', (data) => {
    const { sessionId, orderId, barcode } = data;
    const printerSocketId = sessions.get(sessionId);
    
    if (printerSocketId) {
      io.to(printerSocketId).emit('print-request', {
        orderId,
        barcode
      });
    }
  });

  socket.on('disconnect', () => {
    for (const [sessionId, socketId] of sessions.entries()) {
      if (socketId === socket.id) {
        sessions.delete(sessionId);
        break;
      }
    }
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 