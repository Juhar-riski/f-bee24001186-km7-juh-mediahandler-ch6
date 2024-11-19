const express = require('express');
const router = express.Router();

// Endpoint API yang mengembalikan HTML
router.get('/login', (req, res) => {
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
  </head>
  <body>
    <div class="login-container">
      <h2>Login</h2>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" required>
        </div>
        <button type="submit" class="btn">Login</button>
        <div class="forgot-password">
          <!-- jangan lupa ubah -->
          <a href="localhost:4000/api/v1/password/lupa-pasword">Lupa Password?</a>
        </div>
      </form>
    </div>
  </body>
  </html>
  `;

  // Kirim HTML sebagai respons
  res.set('Content-Type', 'text/html'); // Pastikan tipe konten diatur
  res.send(htmlContent);
});

module.exports = router;
