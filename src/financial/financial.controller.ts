import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { RequirePermission } from '../shared/decorators/require-permission.decorator';
import { PermissionGuard } from '../permissions/guards/permission.guard';
import { ModuleType } from '../shared/constants/enums';

@ApiTags('financial')
@ApiBearerAuth()
@Controller('financial')
@UseGuards(PermissionGuard)
@RequirePermission(ModuleType.FINANCIAL)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter dashboard financeiro' })
  async getDashboard() {
    return this.financialService.getDashboard();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Listar transações financeiras' })
  async getTransactions() {
    return this.financialService.getTransactions();
  }
}