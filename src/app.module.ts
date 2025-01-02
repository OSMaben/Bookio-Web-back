import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BooksService } from './books/books.service';
import { CognitoAuthGuard } from './guards/CognitoAuthGuard';
import { BooksRepository } from './books/repos/books.repository';
import { BooksController } from './books/books.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './guards/AuthService';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
  ],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository, CognitoAuthGuard,AuthService],
})
export class AppModule{}
