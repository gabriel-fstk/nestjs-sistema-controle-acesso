import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ example: 'Smartphone XYZ', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Smartphone com 128GB de armazenamento', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 899.99, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 'Eletrônicos', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}