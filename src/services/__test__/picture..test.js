const Gambar = require('../../services/picture');
const imagekit = require('../../libs/imagekit');
const { PrismaClient } = require('@prisma/client');

// Mocking ImageKit dan Prisma
jest.mock('../../libs/imagekit', () => ({
    upload: jest.fn().mockResolvedValue({
        url: 'http://example.com/test.jpg',
    }),
}));

jest.mock('@prisma/client', () => {
    const prismaMock = {
        picture: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => prismaMock) };
});

const prisma = new PrismaClient();

describe('Gambar Service', () => {
    let gambar;

    beforeEach(() => {
        gambar = new Gambar(); // Setiap test, buat instance baru
        jest.clearAllMocks();  // Reset mocks
    });

    // --- Test createGambar ---
    describe('createGambar', () => {
        it('should create a picture successfully', async () => {
            const mockReq = {
                body: { judul: 'Test Judul', deskription: 'Test Deskripsi' },
                file: {
                    buffer: Buffer.from('test'),
                    originalname: 'test.jpg',
                    mimetype: 'image/jpeg',
                },
            };

            prisma.picture.create.mockResolvedValue({
                id: 1,
                judul: 'Test Judul',
                deskription: 'Test Deskripsi',
                urlGambar: 'http://example.com/test.jpg',
            });

            const result = await gambar.createGambar(mockReq);

            expect(imagekit.upload).toHaveBeenCalledWith({
                file: expect.any(String),
                fileName: 'test.jpg',
                folder: '/uploads',
            });
            expect(prisma.picture.create).toHaveBeenCalledWith({
                data: {
                    judul: 'Test Judul',
                    deskription: 'Test Deskripsi',
                    urlGambar: 'http://example.com/test.jpg',
                },
            });
            expect(result).toEqual({
                id: 1,
                judul: 'Test Judul',
                deskription: 'Test Deskripsi',
                urlGambar: 'http://example.com/test.jpg',
            });
        });

        it('should throw an error if file is not provided', async () => {
            const mockReq = { body: { judul: 'No File', deskription: 'Deskripsi' } };

            await expect(gambar.createGambar(mockReq)).rejects.toThrow('File is required');
            expect(imagekit.upload).not.toHaveBeenCalled();
            expect(prisma.picture.create).not.toHaveBeenCalled();
        });

        it('should throw an error for unsupported file types', async () => {
            const mockReq = {
                body: { judul: 'Invalid File', deskription: 'Deskripsi' },
                file: { mimetype: 'application/pdf' },
            };

            await expect(gambar.createGambar(mockReq)).rejects.toThrow('Only JPEG, JPG and PNG files are allowed');
            expect(imagekit.upload).not.toHaveBeenCalled();
            expect(prisma.picture.create).not.toHaveBeenCalled();
        });
    });

    // --- Test getGambar ---
    describe('getGambar', () => {
        it('should fetch all pictures ordered by id desc', async () => {
            const mockPictures = [
                { id: 1, judul: 'Judul 1', deskription: 'Deskripsi 1', urlGambar: 'url1.jpg' },
            ];
            prisma.picture.findMany.mockResolvedValue(mockPictures);

            const result = await gambar.getGambar();
            expect(prisma.picture.findMany).toHaveBeenCalledWith({ orderBy: { id: 'desc' } });
            expect(result).toEqual(mockPictures);
        });
    });

    // --- Test getGambarDetail ---
    describe('getGambarDetail', () => {
        it('should fetch picture details by ID', async () => {
            const mockPictureDetail = { id: 1, judul: 'Judul 1', deskription: 'Deskripsi 1', urlGambar: 'url1.jpg' };
            prisma.picture.findUnique.mockResolvedValue(mockPictureDetail);

            const result = await gambar.getGambarDetail(1);
            expect(prisma.picture.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(mockPictureDetail);
        });

        it('should return null if picture not found', async () => {
            prisma.picture.findUnique.mockResolvedValue(null);

            const result = await gambar.getGambarDetail(99);
            expect(prisma.picture.findUnique).toHaveBeenCalledWith({ where: { id: 99 } });
            expect(result).toBeNull();
        });
    });

    // --- Test updateGambar ---
    describe('updateGambar', () => {
        it('should update a picture successfully', async () => {
            prisma.picture.findUnique.mockResolvedValue(true);
            prisma.picture.update.mockResolvedValue({
                id: 1,
                judul: 'Updated Judul',
                deskription: 'Updated Deskripsi',
            });

            const result = await gambar.updateGambar(1, { judul: 'Updated Judul', deskription: 'Updated Deskripsi' });

            expect(prisma.picture.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { judul: 'Updated Judul', deskription: 'Updated Deskripsi' },
            });
            expect(result).toEqual({ id: 1, judul: 'Updated Judul', deskription: 'Updated Deskripsi' });
        });

        it('should throw an error if picture is not found', async () => {
            prisma.picture.findUnique.mockResolvedValue(null);

            await expect(
                gambar.updateGambar(1, { judul: 'New Title', deskription: 'New Description' })
            ).rejects.toThrow('Picture not found');
        });
    });

    // --- Test deletePicture ---
    describe('deletePicture', () => {
        it('should delete a picture successfully', async () => {
            prisma.picture.delete.mockResolvedValue({ id: 1 });

            const result = await gambar.deletePicture(1);
            expect(prisma.picture.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual({ id: 1 });
        });
    });
});
