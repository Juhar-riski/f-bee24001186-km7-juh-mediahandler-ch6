const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Sentry = require('@sentry/node');

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Simpan di .env untuk keamanan

// Middleware untuk otorisasi
function authenticateJWT(req, res, next) {
  // Ambil token dari header Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Verifikasi token
  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    try {
      // Ambil informasi user berdasarkan decoded id dari token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.user = user;
      next();
    } catch (error) {
      Sentry.captureException(error);
      res.status(500).json({ message: "internal server error" });
    }
  });
}

module.exports = { authenticateJWT };
