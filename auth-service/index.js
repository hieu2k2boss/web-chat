require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('../models/User');

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET;

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

// Kết nối DB
sequelize.sync().then(() => {
  console.log('✅ DB đã sẵn sàng');
});

// -------- REGISTER --------
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Thiếu username hoặc password' });

  if (!strongPasswordRegex.test(password))
    return res.status(400).json({
      error: 'Mật khẩu phải có chữ hoa, chữ thường, ký tự đặc biệt và ≥8 ký tự'
    });

  const existing = await User.findOne({ where: { username } });
  if (existing) return res.status(409).json({ error: 'Username đã tồn tại' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashedPassword });

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Đăng ký thành công', token });
});

// -------- LOGIN --------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Đăng nhập thành công', token });
});

app.listen(3001, () => {
  console.log('Auth Service chạy tại http://localhost:3001');
});
