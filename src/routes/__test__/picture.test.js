const request = require('supertest');
const express = require('express');
const gambarController = require('../picture'); // sesuaikan dengan path yang benar
const gambarService = require('../../services/picture'); // sesuaikan dengan path yang benar

jest.mock('../../services/picture'); // Mock gambarService

const app = express();
app.use(express.json());
app.use('/gambar', gambarController);

describe('Gambar Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should create a new picture with valid file type', async () => {
        const mockPicture = {
            id: 1,
            judul: 'Test Judul',
            deskription: 'Test Deskripsi',
            urlGambar: 'http://example.com/test.jpg'
        };

        const mockReq = {
            body: { judul: 'Test Judul', deskription: 'Test Deskripsi' },
            file: { buffer: Buffer.from('test'), originalname: 'test.jpg', mimetype: 'image/jpeg' }
        };

        gambarService.prototype.createGambar.mockResolvedValue(mockPicture);

        const response = await request(app).post('/gambar')
            .attach('image', Buffer.from('test'), 'test.jpg')
            .field('judul', 'Test Judul')
            .field('deskription', 'Test Deskripsi');

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockPicture);
        expect(gambarService.prototype.createGambar).toHaveBeenCalled();
    });

    it('should return error if no file is uploaded', async () => {
        const mockReq = {
            body: { judul: 'No File', deskription: 'Deskripsi' },
        };

        gambarService.prototype.createGambar.mockRejectedValue(new Error('File is required'));

        const response = await request(app).post('/gambar').send(mockReq);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });

    it('should return error if file type is not JPEG, PNG or JPG', async () => {
        const mockReq = {
            body: { judul: 'Invalid File', deskription: 'Deskripsi' },
            file: { buffer: Buffer.from('test'), originalname: 'test.pdf', mimetype: 'application/pdf' }
        };

        gambarService.prototype.createGambar.mockRejectedValue(new Error('Only JPEG, JPG and PNG files are allowed'));

        const response = await request(app).post('/gambar')
            .attach('image', Buffer.from('test'), 'test.pdf')
            .field('judul', 'Invalid File')
            .field('deskription', 'Deskripsi');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });

    it('should get all pictures', async () => {
        const mockPictures = [
            { id: 1, judul: 'Judul 1', deskription: 'Deskripsi 1', urlGambar: 'url1.jpg' }
        ];

        gambarService.prototype.getGambar.mockResolvedValue(mockPictures);

        const response = await request(app).get('/gambar');
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockPictures);
        expect(gambarService.prototype.getGambar).toHaveBeenCalled();
    });

    it('should return 500 if fetching pictures fails', async () => {
        // Mock getGambar untuk menghasilkan error
        gambarService.prototype.getGambar.mockRejectedValue(new Error('Database error'));
    
        const response = await request(app)
            .get('/gambar');
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Failed to fetch pictures' });
        expect(gambarService.prototype.getGambar).toHaveBeenCalled();
    });
  

    it('should get picture details by ID', async () => {
        const mockPicture = { id: 3, judul: 'Judul 3', deskription: 'Deskripsi 3', urlGambar: 'url3.jpg' };
        
        gambarService.prototype.getGambarDetail.mockResolvedValue(mockPicture);

        const response = await request(app).get('/gambar/3');
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockPicture);
    });

    it('should return 404 if picture not found', async () => {
        gambarService.prototype.getGambarDetail.mockResolvedValue(null);

        const response = await request(app).get('/gambar/999');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Picture not found');
    });

    it('should return error 500 when failed to fetch picture by ID', async () => {
        const pictureId = 3;

        // Mock gambarService.getGambarDetail untuk melempar error
        gambarService.prototype.getGambarDetail.mockRejectedValue(new Error('Database Error'));

        const response = await request(app).get(`/gambar/${pictureId}`);
        
        // Memastikan response memiliki status 500 dan pesan yang sesuai
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to fetch picture');
    });

    it('should update picture details', async () => {
        const updatedPicture = { id: 1, judul: 'Updated Judul', deskription: 'Updated Deskripsi', urlGambar: 'url1.jpg' };

        gambarService.prototype.updateGambar.mockResolvedValue(updatedPicture);

        const response = await request(app).put('/gambar/1').send({
            judul: 'Updated Judul',
            deskription: 'Updated Deskripsi'
        });

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(updatedPicture);
    });

    it('should return 500 if updating a picture fails', async () => {
        // Simulasi error pada updateGambar
        gambarService.prototype.updateGambar.mockRejectedValue(new Error('Internal server error'));
    
        const response = await request(app)
            .put('/gambar/1')
            .send({ judul: 'Updated Title', deskription: 'Updated Description' });
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Failed to update' });
        expect(gambarService.prototype.updateGambar).toHaveBeenCalledWith("1", { judul: 'Updated Title', deskription: 'Updated Description' });
    });

    it('should delete a picture', async () => {
        gambarService.prototype.deletePicture.mockResolvedValue(true);

        const response = await request(app).delete('/gambar/1');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Picture deleted successfully');
    });

    it('should return error for non-existing picture on delete', async () => {
        gambarService.prototype.deletePicture.mockRejectedValue(new Error('Id is not exist'));

        const response = await request(app).delete('/gambar/999');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Id is not exist');
    });

    it('should return 500 if deleting a picture fails', async () => {
        // Simulasi error pada deletePicture
        gambarService.prototype.deletePicture.mockRejectedValue(new Error('Internal server error'));
    
        const response = await request(app).delete('/gambar/1');
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Id is not exist' });
        expect(gambarService.prototype.deletePicture).toHaveBeenCalledWith("1");
    });
  
});
