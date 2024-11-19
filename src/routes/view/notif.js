const express = require('express');
const router = express.Router();

// Endpoint API yang mengembalikan HTML
router.get('/notifikasi', (req, res) => {
  const htmlContent = `
  <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket Notifications</title>
    <script src="https://cdn.socket.io/4.7.0/socket.io.min.js"></script>
    </head>
    <body>
    <h1>Notifications</h1>
    <div id="notifications"></div>

    <script>
        // Hubungkan ke WebSocket server
        const socket = io();


        socket.on('userNotification', (data) => {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.innerText = data.message;
        notifications.appendChild(notification);
        });

        console.log('WebSocket connected');
    </script>
    </body>
    </html>
  `;

  // Kirim HTML sebagai respons
  res.set('Content-Type', 'text/html'); // Pastikan tipe konten diatur
  res.send(htmlContent);
});

module.exports = router;
