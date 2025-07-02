import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  providers: [ReportsService],
  controllers: [ReportsController],
  imports: [PermissionsModule],
})
export class ReportsModule {}