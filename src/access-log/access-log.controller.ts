import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AccessLogService } from './access-log.service';
import { RequirePermission } from '../shared/decorators/require-permission.decorator';
import { PermissionGuard } from '../permissions/guards/permission.guard';
import { ModuleType } from '../shared/constants/enums';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('access-logs')
@ApiBearerAuth()
@Controller('access-logs')
@UseGuards(PermissionGuard)
@RequirePermission(ModuleType.USER_MANAGEMENT)
export class AccessLogController {
  constructor(private readonly accessLogService: AccessLogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os logs de acesso (paginado)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    
    return this.accessLogService.findAll(pageNumber, limitNumber);
  }

  @Get('user')
  @ApiOperation({ summary: 'Listar logs de acesso do usuário logado' })
  async findByCurrentUser(@CurrentUser() user: any) {
    return this.accessLogService.findByUser(user.sub);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar logs de acesso por usuário específico' })
  async findByUser(@Param('userId') userId: string) {
    return this.accessLogService.findByUser(userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obter estatísticas de acesso' })
  async getStatistics() {
    return this.accessLogService.getStatistics();
  }
}