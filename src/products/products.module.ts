import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  providers: [ProductsService],
  controllers: [ProductsController],
  imports: [PermissionsModule],
})
export class ProductsModule {}