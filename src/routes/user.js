const express = require('express');
const UserService = require('../services/user');
const { authenticateJWT } = require('../middleware/auth');
const hashPassword = require('../middleware/hashpass');
const Sentry = require('@sentry/node');
const router = express.Router();
const userService = new UserService();


// Route untuk membuat user
router.post('/register',hashPassword, async (req, res) => {
    const { userData } = req.body  
    try {
    const newUser = await userService.createUser(userData);

    const io = req.app.get('io'); // Ambil instance io dari app
    io.emit('userNotification', {
      message: `User ${newUser.name} berhasil di register`,
    });

    res.status(201).json(newUser);
  } catch (error) {
    Sentry.captureException(error);
    res.status(400).json({ message: "Bad Request" });
  }
});

// Route untuk mendapatkan semua user
router.get('/', async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: "internal server error" });
  }
});

// Route untuk mendapatkan user berdasarkan ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id, 10));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: "internal server error" });
  }
});

// Route untuk memperbarui user
router.put('/:id',authenticateJWT, async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(parseInt(req.params.id, 10), req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: "internal server error" });
  }
});

// Route untuk menghapus user
router.delete('/:id',authenticateJWT, async (req, res) => {
  try {
    const deletedUser = await userService.deleteUser(parseInt(req.params.id, 10));
    res.status(200).json({ message: 'User data deleted successfully' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: "internal server error" });
  }
});

module.exports = router;

