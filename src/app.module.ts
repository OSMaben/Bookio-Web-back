import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BooksService } from './books/books.service';
import { BooksRepository } from './books/repos/books.repository';
import { BooksController } from './books/books.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
  ],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository],
})
export class AppModule{}
