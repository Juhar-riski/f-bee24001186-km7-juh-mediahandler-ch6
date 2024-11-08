// src/routes/__test__/gambarController.test.js

const request = require('supertest');
const express = require('express');
const Gambar = require('../../services/picture');
const gambarRouter = require('../picture');

jest.mock('../../services/picture');
jest.mock('multer', () => {
    // Mock fungsi `single` untuk menghindari error
    const mMulter = () => ({
        single: jest.fn(() => (req, res, next) => next())
    });
    mMulter.memoryStorage = jest.fn();
    return mMulter;
});

const app = express();
app.use(express.json());
app.use('/gambar', gambarRouter);

describe('Gambar Routes', () => {
    let gambarMock;

    beforeAll(() => {
        gambarMock = new Gambar();
    });

    it('should create a new picture successfully', async () => {
        const mockPicture = {
            id: 1,
            judul: 'Test Judul',
            deskription: 'Test Deskripsi',
            urlGambar: 'http://example.com/test.jpg',
        };

        Gambar.prototype.createGambar.mockResolvedValue(mockPicture);

        const response = await request(app)
            .post('/gambar')
            .field('judul', 'Test Judul')
            .field('deskription', 'Test Deskripsi')
            .attach('image', Buffer.from('file'), 'test.jpg');

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockPicture);
        expect(Gambar.prototype.createGambar).toHaveBeenCalled();
    });

    it('should fetch all pictures', async () => {
        const mockPictures = [
            { id: 1, judul: 'Test 1', deskription: 'Deskripsi 1', urlGambar: 'url1' },
            { id: 2, judul: 'Test 2', deskription: 'Deskripsi 2', urlGambar: 'url2' },
        ];

        Gambar.prototype.getGambar.mockResolvedValue(mockPictures);

        const response = await request(app).get('/gambar');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Fetched pictures successfully',
            data: mockPictures,
        });
        expect(Gambar.prototype.getGambar).toHaveBeenCalled();
    });

    it('should return 500 if fetching pictures fails', async () => {
      // Mock getGambar untuk menghasilkan error
      Gambar.prototype.getGambar.mockRejectedValue(new Error('Database error'));
  
      const response = await request(app)
          .get('/gambar');
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Failed to fetch pictures' });
      expect(Gambar.prototype.getGambar).toHaveBeenCalled();
  });
  

    it('should fetch picture detail by ID', async () => {
        const mockPicture = {
            id: 1,
            judul: 'Test Judul',
            deskription: 'Test Deskripsi',
            urlGambar: 'http://example.com/test.jpg',
        };

        Gambar.prototype.getGambarDetail.mockResolvedValue(mockPicture);

        const response = await request(app).get('/gambar/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Fetched picture successfully',
            data: mockPicture,
        });
        expect(Gambar.prototype.getGambarDetail).toHaveBeenCalledWith("1");
    });

    it('should return 404 if picture is not found', async () => {
        Gambar.prototype.getGambarDetail.mockResolvedValue(null);

        const response = await request(app).get('/gambar/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Picture not found' });
        expect(Gambar.prototype.getGambarDetail).toHaveBeenCalledWith("999");
    });

    it('should update a picture successfully', async () => {
        const updatedPicture = {
            id: 1,
            judul: 'Updated Title',
            deskription: 'Updated Description',
            urlGambar: 'http://example.com/test.jpg',
        };

        Gambar.prototype.updateGambar.mockResolvedValue(updatedPicture);

        const response = await request(app)
            .put('/gambar/1')
            .send({ judul: 'Updated Title', deskription: 'Updated Description' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Picture updated successfully',
            data: updatedPicture,
        });
        expect(Gambar.prototype.updateGambar).toHaveBeenCalledWith("1", {
            judul: 'Updated Title',
            deskription: 'Updated Description',
        });
    });

    it('should return 500 if updating a picture fails', async () => {
      // Simulasi error pada updateGambar
      Gambar.prototype.updateGambar.mockRejectedValue(new Error('Internal server error'));
  
      const response = await request(app)
          .put('/gambar/1')
          .send({ judul: 'Updated Title', deskription: 'Updated Description' });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Failed to update' });
      expect(Gambar.prototype.updateGambar).toHaveBeenCalledWith("1", { judul: 'Updated Title', deskription: 'Updated Description' });
  });
  

    it('should delete a picture successfully', async () => {
        Gambar.prototype.deletePicture.mockResolvedValue();

        const response = await request(app).delete('/gambar/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Picture deleted successfully' });
        expect(Gambar.prototype.deletePicture).toHaveBeenCalledWith("1");
    });

    it('should handle internal server error for create', async () => {
        Gambar.prototype.createGambar.mockRejectedValue(new Error('Internal server error'));

        const response = await request(app)
            .post('/gambar')
            .field('judul', 'Test Judul')
            .field('deskription', 'Test Deskripsi')
            .attach('image', Buffer.from('file'), 'test.jpg');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
    });

    it('should return 500 if deleting a picture fails', async () => {
      // Simulasi error pada deletePicture
      Gambar.prototype.deletePicture.mockRejectedValue(new Error('Internal server error'));
  
      const response = await request(app).delete('/gambar/1');
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Failed to delete picture' });
      expect(Gambar.prototype.deletePicture).toHaveBeenCalledWith("1");
  });
  
});
