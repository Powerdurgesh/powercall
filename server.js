const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const fs = require('fs');

// Create uploads folder if not exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ fileUrl: `/uploads/${req.file.filename}` });
});

io.on('connection', socket => {
  console.log('New user connected');

  socket.on('chatMessage', data => io.emit('chatMessage', data));
  socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
