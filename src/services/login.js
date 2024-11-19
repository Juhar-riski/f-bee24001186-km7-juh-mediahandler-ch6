const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const Sentry = require('@sentry/node');
const prisma = new PrismaClient();

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Simpan di .env untuk keamanan

// Fungsi untuk login dan menghasilkan JWT token
async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate token JWT jika password valid
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: '1h' } // Token berlaku selama 1 jam
    );

    // Kirimkan token ke klien
    res.status(200).json({ token });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: "internal server error" });
  }
}

module.exports = { login };
