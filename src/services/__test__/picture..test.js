const imagekit = require('../../libs/imagekit');
const Gambar = require('../picture');

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
    },
};

describe('Gambar Service', () => {
    let gambar;

    beforeEach(() => {
        gambar = new Gambar(prismaMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new picture successfully', async () => {
        const mockReq = {
            body: { judul: 'Test Judul', deskription: 'Test Deskripsi' },
            file: { buffer: Buffer.from('file'), originalname: 'test.jpg' },
        };
        const mockImagekitResponse = { url: 'http://example.com/test.jpg' };
        const mockPictureData = {
            id: 1,
            judul: 'Test Judul',
            deskription: 'Test Deskripsi',
            urlGambar: mockImagekitResponse.url,
        };

        imagekit.upload.mockResolvedValue(mockImagekitResponse);
        prismaMock.picture.create.mockResolvedValue(mockPictureData);

        const result = await gambar.createGambar(mockReq);

        expect(imagekit.upload).toHaveBeenCalledWith({
            file: mockReq.file.buffer.toString('base64'),
            fileName: mockReq.file.originalname,
            folder: '/uploads',
        });
        expect(prismaMock.picture.create).toHaveBeenCalledWith({
            data: {
                judul: mockReq.body.judul,
                deskription: mockReq.body.deskription,
                urlGambar: mockImagekitResponse.url,
            },
        });
        expect(result).toEqual(mockPictureData);
    });

    it('should return all pictures ordered by id desc', async () => {
        const mockPictures = [
            { id: 1, judul: 'Test 1', deskription: 'Deskripsi 1', urlGambar: 'url1' },
            { id: 2, judul: 'Test 2', deskription: 'Deskripsi 2', urlGambar: 'url2' },
        ];
        prismaMock.picture.findMany.mockResolvedValue(mockPictures);

        const result = await gambar.getGambar();

        expect(prismaMock.picture.findMany).toHaveBeenCalledWith({ orderBy: { id: 'desc' } });
        expect(result).toEqual(mockPictures);
    });

    it('should return picture detail by ID', async () => {
        const mockPictureDetail = { id: 1, judul: 'Test Judul', deskription: 'Deskripsi', urlGambar: 'url1' };
        prismaMock.picture.findUnique.mockResolvedValue(mockPictureDetail);

        const result = await gambar.getGambarDetail(1);

        expect(prismaMock.picture.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(mockPictureDetail);
    });

    it('should update a picture if it exists', async () => {
        const mockUpdatedPicture = { id: 1, judul: 'Updated Title', deskription: 'Updated Description' };
        prismaMock.picture.findUnique.mockResolvedValue({ id: 1 });
        prismaMock.picture.update.mockResolvedValue(mockUpdatedPicture);

        const result = await gambar.updateGambar(1, { judul: 'Updated Title', deskription: 'Updated Description' });

        expect(prismaMock.picture.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { judul: 'Updated Title', deskription: 'Updated Description' },
        });
        expect(result).toEqual(mockUpdatedPicture);
    });

    it('should delete a picture by ID', async () => {
        const mockDeletedPicture = { id: 1 };
        prismaMock.picture.delete.mockResolvedValue(mockDeletedPicture);

        const result = await gambar.deletePicture(1);

        expect(prismaMock.picture.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(mockDeletedPicture);
    });
});
