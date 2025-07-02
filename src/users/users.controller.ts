import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { RequirePermission } from '../shared/decorators/require-permission.decorator';
import { PermissionGuard } from '../permissions/guards/permission.guard';
import { ModuleType, UserRole } from '../shared/constants/enums';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(PermissionGuard)
@RequirePermission(ModuleType.USER_MANAGEMENT)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário (apenas Admin e Superuser)' })
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    // Apenas Admin e Superuser podem criar usuários
    if (user.role === UserRole.USER) {
      throw new ForbiddenException('Apenas administradores podem criar usuários');
    }

    // Admin não pode criar outro Admin ou Superuser
    if (user.role === UserRole.ADMIN && createUserDto.role !== UserRole.USER) {
      throw new ForbiddenException('Administradores só podem criar usuários comuns');
    }

    return this.usersService.create(createUserDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(id, updateUserDto, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar usuário' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user.sub);
  }
}