import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { BooksRepository } from './repos/books.repository';
@Module({
  controllers: [BooksController],
  providers: [BooksService,
    BooksRepository
  ],
})
export class BooksModule {}
