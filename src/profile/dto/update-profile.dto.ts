import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'João Silva', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'newpassword123', required: false, minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}