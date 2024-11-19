const express = require('express');
const prisma = require('@prisma/client').PrismaClient;
const crypto = require('crypto');
const Sentry = require('@sentry/node');
const bcrypt = require('bcrypt');
const sendResetPasswordEmail = require('../libs/send-mail');

const prismaClient = new prisma();
const router = express.Router();

router.post('/lupa-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email harus diisi.' });
  }

  try {
    // Buat token reset
    const token = crypto.randomBytes(32).toString('hex');
    await sendResetPasswordEmail(req.app.get('io'), email, token);

     // Simpan token dan waktu kadaluwarsa ke database (1 jam dari sekarang)
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
    await prismaClient.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });
      
    return res.status(200).json({ message: 'Email reset password telah dikirim.' });
    } 
    catch (error) {
      Sentry.captureException(error);
      res.status(500).json({ message: "internal server error" });
    }
});
/**
 * Endpoint untuk mereset password
 * @route POST /api/reset-password/:email/:token
 */
router.post('/reset-password/:email/:token', async (req, res) => {
  const { email, token } = req.params;
  const { password } = req.body;

  if (!email || !token || !password) {
    return res.status(400).json({ message: 'Email, token, dan password baru harus diisi.' });
  }

  try {
    // Cari pengguna berdasarkan email dan token
    const user = await prismaClient.user.findFirst({
      where: {
        email,
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // Token belum kedaluwarsa
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    const io = req.app.get('io'); // Ambil instance io dari app
    io.emit('userNotification', {
      message: `Password berhasil di reset`,
    });

    // Update password dan hapus token reset
    await prismaClient.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null, // Hapus token setelah digunakan
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({ message: 'Password berhasil diperbarui.' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: "internal server error" });
  }
});

module.exports = router;