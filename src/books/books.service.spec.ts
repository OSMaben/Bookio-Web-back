import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { BooksRepository } from './repos/books.repository';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CreateBookDto } from './dto/create-book.dto';

jest.mock('@aws-sdk/client-s3', () => {
  const mockS3Client = {
    send: jest.fn(),
  };

  return {
    S3Client: jest.fn(() => mockS3Client),
    PutObjectCommand: jest.fn(),
  };
});

describe('BooksService', () => {
  let service: BooksService;
  let mockBooksRepository: Partial<BooksRepository>;
  let mockS3Client;

  beforeEach(async () => {
    mockBooksRepository = {
      createBook: jest.fn(),
      getAllBooks: jest.fn().mockResolvedValue([
        { id: '1', title: 'Book 1', author: 'Author 1' },
        { id: '2', title: 'Book 2', author: 'Author 2' },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: BooksRepository, useValue: mockBooksRepository },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    mockS3Client = service['s3Client'];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book and upload image to S3', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
        price: 10,
        category: 'Fiction', 
        borrowedBy: 'User123'
      };
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image buffer'),
      } as Express.Multer.File;

      const mockS3Url = 'https://mock-bucket.s3.mock-region.amazonaws.com/books/test.jpg';

      mockS3Client.send.mockResolvedValue({});
      jest.spyOn(service as any, 'uploadImageToS3').mockResolvedValue(mockS3Url);
      jest.spyOn(mockBooksRepository, 'createBook').mockResolvedValue({
        id: '1',
        ...createBookDto,
        imageUrl: mockS3Url,
      });

      const result = await service.create(createBookDto, mockFile);

      expect(service['uploadImageToS3']).toHaveBeenCalledWith(mockFile);
      expect(mockBooksRepository.createBook).toHaveBeenCalledWith({
        ...createBookDto,
        imageUrl: mockS3Url,
      });
      expect(result).toEqual({
        id: '1',
        ...createBookDto,
        imageUrl: mockS3Url,
      });
    });
  });

  describe('findAll', () => {
    it('should return all books', async () => {
      const result = await service.findAll();
      expect(result).toEqual([
        { id: '1', title: 'Book 1', author: 'Author 1' },
        { id: '2', title: 'Book 2', author: 'Author 2' },
      ]);
      expect(mockBooksRepository.getAllBooks).toHaveBeenCalled();
    });
  });
});
