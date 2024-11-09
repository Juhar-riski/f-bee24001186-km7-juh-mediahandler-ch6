
require('dotenv').config();
const imagekit = require('../libs/imagekit');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


class Gambar {
    async createGambar(req) {
        const { judul, deskription } = req.body;
        const file = req.file;
        
        if (!file) throw new Error('File is required');

        const allowedMimeTypes = ['image/jpeg', 'image/png','image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Only JPEG, JPG and PNG files are allowed');
        }

        const response = await imagekit.upload({
            file: file.buffer.toString('base64'),
            fileName: file.originalname,
            folder: '/uploads',
        });

        const picture = await prisma.picture.create({
            data: {
                judul,
                deskription,
                urlGambar: response.url,
            },
        });

        return picture;
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