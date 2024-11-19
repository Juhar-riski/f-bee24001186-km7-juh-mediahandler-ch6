
require('dotenv').config();
const imagekit = require('../libs/imagekit');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const prisma = new PrismaClient();


const storage = multer.memoryStorage(); // Menyimpan file di memory (buffer)
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // Batasi ukuran file maksimal 5MB
    fileFilter: (req, file, cb) => {
        // Validasi file yang diizinkan
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Class Gambar untuk mengelola gambar
class Gambar {
    // Method untuk membuat gambar baru
    async createGambar(req) {
        const { judul, deskription } = req.body;
        const file = req.file;
    
        if (!judul || !deskription) throw new Error('Judul and Deskription are required');
        if (!file) throw new Error('File is required');
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
            throw new Error('Only JPEG, JPG and PNG files are allowed');
        }
    
        const response = await imagekit.upload({
            file: file.buffer.toString('base64'),
            fileName: file.originalname,
            folder: '/uploads',
        });
    
        return prisma.picture.create({
            data: { judul, deskription, urlGambar: response.url },
        });
    }
    

    async getGambar() {
        return await prisma.picture.findMany({
            orderBy: { id: 'desc' },
        });
    }

    async getGambarDetail(pictureId) {
        return await prisma.picture.findUnique({
            where: { id: Number(pictureId) },
        });
    }

    async updateGambar(pictureId, { judul, deskription }) {
        const herePicture = await prisma.picture.findUnique({
            where: { id: Number(pictureId) },
        });

        if (!herePicture) throw new Error('Picture not found');

        const updatedPicture = await prisma.picture.update({
            where: { id: Number(pictureId) },
            data: { judul, deskription },
        });

        return updatedPicture;
    }

    async deletePicture(pictureId) {
        return await prisma.picture.delete({
            where: { id: Number(pictureId) },
        });
    }
}

module.exports = Gambar;