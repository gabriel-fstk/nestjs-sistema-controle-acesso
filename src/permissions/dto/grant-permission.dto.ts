import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ModuleType } from '../../shared/constants/enums';

export class GrantPermissionDto {
  @ApiProperty({ example: 'user-id-here' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    enum: Object.values(ModuleType), 
    example: ModuleType.FINANCIAL,
    description: 'Tipo do módulo para conceder permissão'
  })
  @IsIn(Object.values(ModuleType))
  moduleType: string;
}