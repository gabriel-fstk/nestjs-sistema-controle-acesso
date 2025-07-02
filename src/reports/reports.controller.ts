import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RequirePermission } from '../shared/decorators/require-permission.decorator';
import { PermissionGuard } from '../permissions/guards/permission.guard';
import { ModuleType } from '../shared/constants/enums';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(PermissionGuard)
@RequirePermission(ModuleType.REPORTS)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('users')
  @ApiOperation({ summary: 'Relatório de usuários' })
  async getUsersReport() {
    return this.reportsService.getUsersReport();
  }

  @Get('access')
  @ApiOperation({ summary: 'Relatório de acessos' })
  async getAccessReport() {
    return this.reportsService.getAccessReport();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Relatório de permissões' })
  async getPermissionsReport() {
    return this.reportsService.getPermissionsReport();
  }
}