require('dotenv').config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*', // ⚠️ Trong production nên giới hạn domain
    methods: ['GET', 'POST']
  }
});

app.use(bodyParser.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch(err => console.error('❌ MongoDB lỗi:', err));

// ======= Socket.IO =======
io.on('connection', (socket) => {
  console.log(`🔌 Người dùng kết nối: ${socket.id}`);

  // Lắng nghe khi client gửi tin nhắn
  socket.on('send_message', async (data) => {
    const { from, to, content } = data;

    if (!from || !to || !content) return;

    const message = new Message({ from, to, content });
    await message.save();

    // Phát lại cho người nhận
    io.emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Mất kết nối: ${socket.id}`);
  });
});

// ======= API REST (Lấy tin nhắn cũ) =======
app.get('/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  const messages = await Message.find({
    $or: [
      { from: user1, to: user2 },
      { from: user2, to: user1 }
    ]
  }).sort({ createdAt: 1 });

  res.json({ messages });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`📨 Chat Service chạy realtime tại http://localhost:${PORT}`);
});
