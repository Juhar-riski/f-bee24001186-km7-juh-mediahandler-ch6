const request = require('supertest');
const express = require('express');
const gambarController = require('../picture');
const gambarService = require('../../services/picture');

// Mock gambarService
jest.mock('../../services/picture');

const app = express();
app.use(express.json());
app.use('/', gambarController);

describe('gambarController', () => {
    let mockGambarService;

    beforeEach(() => {
        mockGambarService = require('../../services/picture');
        jest.clearAllMocks();
    });

    // === TEST POST ===
    describe('POST /', () => {
        it('should create a picture successfully', async () => {
            mockGambarService.prototype.createGambar.mockResolvedValue({
                id: 1,
                judul: 'Test Judul',
                deskription: 'Test Deskripsi',
                urlGambar: 'http://example.com/test.jpg',
            });

            const response = await request(app)
                .post('/')
                .set('Content-Type', 'multipart/form-data')
                .attach('image', Buffer.from('test image'), 'test.jpg')
                .field('judul', 'Test Judul')
                .field('deskription', 'Test Deskripsi');

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                id: 1,
                judul: 'Test Judul',
                deskription: 'Test Deskripsi',
                urlGambar: 'http://example.com/test.jpg',
            });
            expect(mockGambarService.prototype.createGambar).toHaveBeenCalled();
        });

        it('should return 400 if file is missing', async () => {
            mockGambarService.prototype.createGambar.mockRejectedValue(new Error('File is required'));
    
            const response = await request(app)
                .post('/')
                .send({ judul: 'Test Judul', deskription: 'Test Deskripsi' });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'File is required' });
            expect(mockGambarService.prototype.createGambar).toHaveBeenCalled();
        });
    
        it('should return 400 if file type is invalid', async () => {
            mockGambarService.prototype.createGambar.mockRejectedValue(new Error('Only JPEG, JPG and PNG files are allowed'));
    
            const response = await request(app)
                .post('/')
                .set('Content-Type', 'multipart/form-data')
                .attach('image', Buffer.from('test image'), 'test.pdf')
                .field('judul', 'Test Judul')
                .field('deskription', 'Test Deskripsi');
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Only JPEG, JPG and PNG files are allowed' });
            expect(mockGambarService.prototype.createGambar).toHaveBeenCalled();
        });
    });

    // === TEST GET ALL ===
    describe('GET /', () => {
        it('should fetch all pictures successfully', async () => {
            mockGambarService.prototype.getGambar.mockResolvedValue([
                { id: 1, judul: 'Judul 1', deskription: 'Deskripsi 1', urlGambar: 'http://example.com/1.jpg' },
                { id: 2, judul: 'Judul 2', deskription: 'Deskripsi 2', urlGambar: 'http://example.com/2.jpg' },
            ]);

            const response = await request(app).get('/');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Fetched pictures successfully',
                data: [
                    { id: 1, judul: 'Judul 1', deskription: 'Deskripsi 1', urlGambar: 'http://example.com/1.jpg' },
                    { id: 2, judul: 'Judul 2', deskription: 'Deskripsi 2', urlGambar: 'http://example.com/2.jpg' },
                ],
            });
            expect(mockGambarService.prototype.getGambar).toHaveBeenCalled();
        });
    });

    // === TEST GET BY ID ===
    describe('GET /:id', () => {
        it('should fetch a picture by ID', async () => {
            mockGambarService.prototype.getGambarDetail.mockResolvedValue({
                id: 1,
                judul: 'Judul 1',
                deskription: 'Deskripsi 1',
                urlGambar: 'http://example.com/1.jpg',
            });

            const response = await request(app).get('/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Fetched picture successfully',
                data: {
                    id: 1,
                    judul: 'Judul 1',
                    deskription: 'Deskripsi 1',
                    urlGambar: 'http://example.com/1.jpg',
                },
            });
            expect(mockGambarService.prototype.getGambarDetail).toHaveBeenCalledWith('1');
        });

        it('should return 404 if picture is not found', async () => {
            mockGambarService.prototype.getGambarDetail.mockResolvedValue(null);

            const response = await request(app).get('/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Picture not found' });
            expect(mockGambarService.prototype.getGambarDetail).toHaveBeenCalledWith('999');
        });
    });

    // === TEST UPDATE ===
    describe('PUT /:id', () => {
        it('should update a picture successfully', async () => {
            mockGambarService.prototype.updateGambar.mockResolvedValue({
                id: 1,
                judul: 'Updated Judul',
                deskription: 'Updated Deskripsi',
            });

            const response = await request(app)
                .put('/1')
                .send({ judul: 'Updated Judul', deskription: 'Updated Deskripsi' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Picture updated successfully',
                data: {
                    id: 1,
                    judul: 'Updated Judul',
                    deskription: 'Updated Deskripsi',
                },
            });
            expect(mockGambarService.prototype.updateGambar).toHaveBeenCalledWith('1', {
                judul: 'Updated Judul',
                deskription: 'Updated Deskripsi',
            });
        });

        it('should return 404 if picture is not found', async () => {
            mockGambarService.prototype.updateGambar.mockRejectedValue(new Error('Picture not found'));
    
            const response = await request(app)
                .put('/999')
                .send({ judul: 'Updated Judul', deskription: 'Updated Deskripsi' });
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Picture not found' });
            expect(mockGambarService.prototype.updateGambar).toHaveBeenCalledWith('999', {
                judul: 'Updated Judul',
                deskription: 'Updated Deskripsi',
            });
        });
    });

    // === TEST DELETE ===
    describe('DELETE /:id', () => {
        it('should delete a picture successfully', async () => {
            const response = await request(app).delete('/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Picture deleted successfully',
            });
            expect(mockGambarService.prototype.deletePicture).toHaveBeenCalledWith('1');
        });

        it('should return 404 if picture is not found', async () => {
            mockGambarService.prototype.deletePicture.mockRejectedValue(new Error('Picture not found'));
    
            const response = await request(app).delete('/999');
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Picture not found' });
            expect(mockGambarService.prototype.deletePicture).toHaveBeenCalledWith('999');
        });    
    });
});
