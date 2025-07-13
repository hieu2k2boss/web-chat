const express = require('express');
const app = express();

app.get('/profile', (req, res) => {
  res.json({ name: 'Hiếu', age: 25 });
});

app.listen(3002, () => {
  console.log('User Service chạy tại http://localhost:3002');
});