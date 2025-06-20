const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath) || !fs.statSync(uploadsPath).isDirectory()) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ fileUrl: `/uploads/${req.file.filename}`, originalName: req.file.originalname });
});

io.on('connection', socket => {
  console.log('User connected');

  socket.on('join', username => {
    socket.username = username;
    socket.broadcast.emit('chatMessage', { user: 'System', text: `${username} joined the chat` });
  });

  socket.on('chatMessage', msg => {
    io.emit('chatMessage', { user: socket.username, text: msg.text });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      socket.broadcast.emit('chatMessage', { user: 'System', text: `${socket.username} left the chat` });
    }
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
