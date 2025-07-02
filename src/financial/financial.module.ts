import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  providers: [FinancialService],
  controllers: [FinancialController],
  imports: [PermissionsModule],
})
export class FinancialModule {}