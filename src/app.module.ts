import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProfileModule } from './profile/profile.module';
import { FinancialModule } from './financial/financial.module';
import { ReportsModule } from './reports/reports.module';
import { ProductsModule } from './products/products.module';
import { AccessLogModule } from './access-log/access-log.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AccessLogInterceptor } from './shared/interceptors/access-log.interceptor';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PermissionsModule,
    ProfileModule,
    FinancialModule,
    ReportsModule,
    ProductsModule,
    AccessLogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AccessLogInterceptor,
    },
  ],
})
export class AppModule {}