import { IsString, IsNumber, IsNotEmpty, Min, MaxLength, IsOptional } from 'class-validator';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    author: string; 

    @IsNumber()
    @Min(10)
    price: number;

    @IsString()
    @MaxLength(1000)
    description: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    category: string;

    @IsString()
    @IsOptional()
    borrowedBy: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}
