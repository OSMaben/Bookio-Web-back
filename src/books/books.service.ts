import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BooksRepository } from './repos/books.repository';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


@Injectable()
export class BooksService {
  constructor(private readonly booksRepository: BooksRepository) {}
  private readonly s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });


  async create(createBookDto: CreateBookDto, file: Express.Multer.File) {
    const imageUrl = await this.uploadImageToS3(file);
    
    const bookWithImage = {
      ...createBookDto,
      imageUrl
    };

   
    const book = await this.booksRepository.createBook(bookWithImage);
    return book;
  }

  private async uploadImageToS3(file: Express.Multer.File): Promise<string> {
    const key = `books/${Date.now()}-${file.originalname}`;
    
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  findAll() {
    const books  = this.booksRepository.getAllBooks();
    return books;
  }

  findOne(id: string) {
    const book = this.booksRepository.getBook(id);
    return book;
  }

  update(id: string, updateBookDto: UpdateBookDto) {
    const book = this.booksRepository.updateBook(id, updateBookDto);
    return book;
  }

  remove(id: string) {
    const book = this.booksRepository.deleteBook(id);
    return book;
  }

  borrowBook(id: string, borrowedBy: string) {
      const book = this.booksRepository.Borrowbook(id, borrowedBy);
      return book;
  }

  returnBook(id: string) {
    const book = this.booksRepository.Returnbook(id);
    return book;
  }

  
}
