import { BadRequestException, Injectable,NotFoundException } from "@nestjs/common";
import { UpdateBookDto } from "../dto/update-book.dto";
import { CreateBookDto } from '../dto/create-book.dto';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
require('dotenv').config();

@Injectable()
export class BooksRepository{
    private readonly dynamoDb: DynamoDBDocumentClient;
    private readonly tableName = 'bookios';

       
        
    constructor() {
        const client = new DynamoDBClient({ 
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'yAKIAR3HUOSZU5VRZVXEM',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mDb2Bdt+UF+bl8Lno6qrmHbXe3yOmtT3dAeDcI2K'
            }
        });
        this.dynamoDb = DynamoDBDocumentClient.from(client);   
    }

    

    async createBook(createBookDto: CreateBookDto & { imageUrl?: string }): Promise<any> {
        try {
          const bookItem = {
            id: uuidv4(),
            ...createBookDto,
            createdAt: new Date().toISOString(),
          };
    
          const command = new PutCommand({
            TableName: this.tableName,
            Item: bookItem,
          });
    
          await this.dynamoDb.send(command);
          return bookItem;
        } catch (error) {
          console.error('Error creating book:', error);
          throw new Error(`Failed to create book: ${error.message}`);
        }
      }



      async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<any> {
        try {
          const updateExpressionParts: string[] = [];
          const expressionAttributeNames: { [key: string]: string } = {};
          const expressionAttributeValues: { [key: string]: any } = {};
    
          Object.keys(updateBookDto).forEach((key) => {
            if (updateBookDto[key] !== undefined) {
              updateExpressionParts.push(`#${key} = :${key}`);
              expressionAttributeNames[`#${key}`] = key;
              expressionAttributeValues[`:${key}`] = updateBookDto[key];
            }
          });
    
          if (updateExpressionParts.length === 0) {
            throw new Error('No fields to update');
          }
    
          const command = new UpdateCommand({
            TableName: this.tableName,
            Key: { id },
            UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
          });
    
          const response = await this.dynamoDb.send(command);
    
          if (!response.Attributes) {
            throw new NotFoundException(`Book with ID "${id}" not found`);
          }
    
          return response.Attributes;
        } catch (error) {
          console.error('Error updating book:', error);
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw new Error(`Failed to update book: ${error.message}`);
        }
      }
    
      async getBook(id: string): Promise<any> {
        try {
          const command = new GetCommand({
            TableName: this.tableName,
            Key: { id },
          });
    
          const response = await this.dynamoDb.send(command);
    
          if (!response.Item) {
            throw new NotFoundException(`Book with ID "${id}" not found`);
          }
    
          return response.Item;
        } catch (error) {
          console.error('Error getting book:', error);
          throw error;
        }
      }



      async deleteBook(id: string): Promise<any> {
        try {

            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: { id },
            })

            await this.dynamoDb.send(command);
            return { message: 'Book deleted successfully' };
        } catch (error) {
            console.error('Error deleting book:', error);
            throw error;
        }
    }


    async getAllBooks(): Promise<any> {
        try{

            const command = new ScanCommand({
                TableName: this.tableName,
            });

            const response = await this.dynamoDb.send(command);
            return response.Items || [];
        } catch (error) {
            console.error('Error getting all books:', error);
            throw error;
        }
    }


    async Borrowbook(id: string , borrowedBy: string): Promise<any> {
        try {
            const book = await this.getBook(id);
          if(book.borrowedBy !== '0'){
            throw new BadRequestException('Book is already borrowed');
          }
          const command = new UpdateCommand({
            TableName: this.tableName,
            Key: { id },
            UpdateExpression: 'set borrowedBy = :borrowedBy',
            ExpressionAttributeValues: {
              ':borrowedBy': borrowedBy,
            },
          });

          await this.dynamoDb.send(command);
          return { message: 'Book borrowed successfully' };
        } catch (error) {
          console.error('Error borrowing book:', error);
          throw error;
        }
    }


    async Returnbook(id: string): Promise<any> {
        try {
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: { id },
                UpdateExpression: 'set borrowedBy = 0',
              });

              await this.dynamoDb.send(command);
              return { message: 'Book returned successfully' };
        } catch (error) {
          console.error('Error returning book:', error);
          throw error;
        }
    }
}


        
