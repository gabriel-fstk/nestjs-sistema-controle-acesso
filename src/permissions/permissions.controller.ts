import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { RequirePermission } from '../shared/decorators/require-permission.decorator';
import { PermissionGuard } from './guards/permission.guard';
import { ModuleType, UserRole } from '../shared/constants/enums';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(PermissionGuard)
@RequirePermission(ModuleType.USER_MANAGEMENT)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('grant')
  @ApiOperation({ summary: 'Conceder permissão a um usuário' })
  async grantPermission(
    @Body() grantPermissionDto: GrantPermissionDto,
    @CurrentUser() user: any,
  ) {
    // Apenas Admin e Superuser podem conceder permissões
    if (user.role === UserRole.USER) {
      throw new ForbiddenException('Apenas administradores podem conceder permissões');
    }

    return this.permissionsService.grantPermission(
      grantPermissionDto.userId,
      grantPermissionDto.moduleType,
      user.sub,
    );
  }

  @Delete('revoke/:userId/:moduleType')
  @ApiOperation({ summary: 'Revogar permissão de um usuário' })
  async revokePermission(
    @Param('userId') userId: string,
    @Param('moduleType') moduleType: string,
    @CurrentUser() user: any,
  ) {
    // Apenas Admin e Superuser podem revogar permissões
    if (user.role === UserRole.USER) {
      throw new ForbiddenException('Apenas administradores podem revogar permissões');
    }

    return this.permissionsService.revokePermission(userId, moduleType);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar permissões de um usuário' })
  async getUserPermissions(@Param('userId') userId: string) {
    return this.permissionsService.getUserPermissions(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as permissões' })
  async listAllPermissions() {
    return this.permissionsService.listAllPermissions();
  }
}