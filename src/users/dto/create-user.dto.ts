import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsIn, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../../shared/constants/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    enum: Object.values(UserRole), 
    example: UserRole.USER,
    description: 'Papel do usuário no sistema'
  })
  @IsIn(Object.values(UserRole))
  @IsOptional()
  role?: string = UserRole.USER;
}