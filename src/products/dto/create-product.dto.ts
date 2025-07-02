import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Smartphone XYZ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Smartphone com 128GB de armazenamento' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 899.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Eletrônicos' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stock: number;
}