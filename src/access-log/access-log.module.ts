import { Module } from '@nestjs/common';
import { AccessLogService } from './access-log.service';
import { AccessLogController } from './access-log.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  providers: [AccessLogService],
  controllers: [AccessLogController],
  imports: [PermissionsModule],
})
export class AccessLogModule {}