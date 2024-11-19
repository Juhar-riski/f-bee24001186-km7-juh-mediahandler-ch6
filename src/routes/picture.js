// gambarController.js
const express = require('express');
const multer = require('multer');
const Sentry = require('@sentry/node');
const gambar = require('../services/picture');


const gambarService = new gambar();

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const pictures = await gambarService.createGambar(req, res);
        res.status(201).json(pictures);
    } catch (error) {
        Sentry.captureException(error);
        if (error.message === 'File is required') {
            return res.status(400).json({ message: error.message });
        }

        if (error.message === 'Only JPEG, JPG and PNG files are allowed') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'internal server error' });
    }
});


router.get('/', async (req, res) => {
    try {
        const pictures = await gambarService.getGambar();
        res.status(200).json({
            message: 'Fetched pictures successfully',
            data: pictures
        });
    } catch (error) {
        Sentry.captureException(error);
        res.status(500).json({ message: "internal server error" });
    }
});


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
        Sentry.captureException(error);
        res.status(500).json({ message: "internal server error" });
    }
});


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
        Sentry.captureException(error);
        if (error.message === 'Picture not found') {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: 'internal server error' });
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
        Sentry.captureException(error);
        if (error.message === 'Picture not found') {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: 'internal server error' });
    }
});

module.exports = router;
