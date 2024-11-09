// gambarController.js
const express = require('express');
const multer = require('multer');
const gambar = require('../services/picture'); // pastikan path benar
const { error } = require('console');
const upload = multer(); // menggunakan multer untuk meng-handle upload file

// Membuat instance gambar
const gambarService = new gambar();

const router = express.Router();

// Endpoint POST untuk meng-upload gambar
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const pictures = await gambarService.createGambar(req, res);
        res.status(201).json(pictures);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint GET untuk mengambil semua gambar
router.get('/', async (req, res) => {
    try {
        const pictures = await gambarService.getGambar();
        res.status(200).json({
            message: 'Fetched pictures successfully',
            data: pictures
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pictures' });
    }
});

// Endpoint GET untuk mengambil detail gambar berdasarkan ID
router.get('/:id', async (req, res) => {
    try {
        const pictureId = req.params.id;
        const picture = await gambarService.getGambarDetail(pictureId);
        if (!picture) {
            return res.status(404).json({ message: 'Picture not found' });
        }
        res.status(200).json({
            message: 'Fetched picture successfully',
            data: picture
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch picture' });
    }
});

// Endpoint PUT untuk memperbarui gambar
router.put('/:id', async (req, res) => {
    const pictureId = req.params.id;
    const { judul, deskription } = req.body;

    try {
        const updatedPicture = await gambarService.updateGambar(pictureId, { judul, deskription });
        res.status(200).json({
            message: 'Picture updated successfully',
            data: updatedPicture
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update' });
    }
});

// Endpoint DELETE untuk menghapus gambar berdasarkan ID
router.delete('/:id', async (req, res) => {
    try {
        const pictureId = req.params.id;

        await gambarService.deletePicture(pictureId);
        res.status(200).json({
            message: 'Picture deleted successfully'
        });
    } catch (error) {
        res.status(400).json({ message: 'Id is not exist' });
    }
});

module.exports = router;
