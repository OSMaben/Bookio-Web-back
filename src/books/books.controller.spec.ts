import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBooksService = {
    findAll: jest.fn().mockResolvedValue([
      { id: 1, title: 'Book One', author: 'Author One' },
      { id: 2, title: 'Book Two', author: 'Author Two' },
    ]),
    findOne: jest.fn().mockResolvedValue({ id: 1, title: 'Book One', author: 'Author One' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService, // Use the mock service
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a list of books', async () => {
    const books = await controller.findAll();
    expect(books).toEqual([
      { id: 1, title: 'Book One', author: 'Author One' },
      { id: 2, title: 'Book Two', author: 'Author Two' },
    ]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a single book', async () => {
    const book = await controller.findOne('1');
    expect(book).toEqual({ id: 1, title: 'Book One', author: 'Author One' });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });
});
