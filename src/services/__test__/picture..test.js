// src/services/__test__/picture.test.js

const { PrismaClient } = require('@prisma/client');
const Gambar = require('../picture');
const imagekit = require('../../libs/imagekit');

jest.mock('../../libs/imagekit', () => ({
    upload: jest.fn(),
}));

const prismaMock = {
    picture: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    }
};

describe('Gambar Service', () => {
    const gambar = new Gambar(prismaMock);

    it('should create a new picture successfully', async () => {
        const mockReq = {
            body: { judul: 'Test Judul', deskription: 'Test Deskripsi' },
            file: { buffer: Buffer.from('file'), originalname: 'test.jpg' }
        };
        const mockImagekitResponse = { url: 'http://example.com/test.jpg' };

        imagekit.upload.mockResolvedValue(mockImagekitResponse);
        prismaMock.picture.create.mockResolvedValue({
            id: 1,
            judul: 'Test Judul',
            deskription: 'Test Deskripsi',
            urlGambar: mockImagekitResponse.url,
        });

        const result = await gambar.createGambar(mockReq);

        expect(imagekit.upload).toHaveBeenCalledWith({
            file: mockReq.file.buffer.toString('base64'),
            fileName: mockReq.file.originalname,
            folder: '/uploads',
        });
        expect(prismaMock.picture.create).toHaveBeenCalled();
        expect(result).toEqual({
            id: 1,
            judul: 'Test Judul',
            deskription: 'Test Deskripsi',
            urlGambar: 'http://example.com/test.jpg'
        });
    });

    it('should return all pictures ordered by id desc', async () => {
        const mockPictures = [
            { id: 1, judul: 'Test 1', deskription: 'Deskripsi 1', urlGambar: 'url1' },
            { id: 2, judul: 'Test 2', deskription: 'Deskripsi 2', urlGambar: 'url2' }
        ];
        prismaMock.picture.findMany.mockResolvedValue(mockPictures);

        const result = await gambar.getGambar();

        expect(prismaMock.picture.findMany).toHaveBeenCalledWith({ orderBy: { id: 'desc' } });
        expect(result).toEqual(mockPictures);
    });

    it('should return picture detail by ID', async () => {
        prismaMock.picture.findUnique.mockResolvedValue({
            id: 1, judul: 'Test Judul', deskription: 'Deskripsi', urlGambar: 'url1'
        });

        const result = await gambar.getGambarDetail(1);

        expect(prismaMock.picture.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual({ id: 1, judul: 'Test Judul', deskription: 'Deskripsi', urlGambar: 'url1' });
    });

    it('should update a picture if it exists', async () => {
        prismaMock.picture.findUnique.mockResolvedValue({ id: 1 });
        prismaMock.picture.update.mockResolvedValue({ id: 1, judul: 'Updated Title', deskription: 'Updated Description' });

        const result = await gambar.updateGambar(1, { judul: 'Updated Title', deskription: 'Updated Description' });

        expect(prismaMock.picture.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { judul: 'Updated Title', deskription: 'Updated Description' } });
        expect(result).toEqual({ id: 1, judul: 'Updated Title', deskription: 'Updated Description' });
    });

    it('should delete a picture by ID', async () => {
        prismaMock.picture.delete.mockResolvedValue({ id: 1 });

        await gambar.deletePicture(1);

        expect(prismaMock.picture.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
});
