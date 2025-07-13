const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy tới auth-service
app.use('/auth', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/auth': '' }
}));

// Proxy tới user-service
app.use('/user', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/user': '' }
}));

app.listen(3000, () => {
  console.log('API Gateway chạy tại http://localhost:3000');
});
