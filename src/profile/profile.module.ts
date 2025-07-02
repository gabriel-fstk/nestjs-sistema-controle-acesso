import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController],
  imports: [PermissionsModule],
})
export class ProfileModule {}