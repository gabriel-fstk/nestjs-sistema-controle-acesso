import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsIn, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { UserRole } from '../../shared/constants/enums';

export class UpdateUserDto {
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

  @ApiProperty({ 
    enum: Object.values(UserRole), 
    required: false,
    description: 'Papel do usuário no sistema'
  })
  @IsIn(Object.values(UserRole))
  @IsOptional()
  role?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}