import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';
import { AccessStatus, ModuleType } from '../constants/enums';

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const route = request.route?.path || request.url;
    const method = request.method;
    const ip = request.ip;
    const userAgent = request.get('user-agent');

    // Determinar o módulo baseado na rota
    const moduleType = this.getModuleFromRoute(route);

    return next.handle().pipe(
      tap({
        next: () => {
          // Log de acesso concedido
          if (user && moduleType) {
            this.logAccess(
              user.sub,
              moduleType,
              AccessStatus.GRANTED,
              route,
              method,
              ip,
              userAgent,
            );
          }
        },
        error: (error) => { //FIX: Não grava - Access Denied
          // Log de acesso negado
          if (user && moduleType && error.status === 403) {
            this.logAccess(
              user.sub,
              moduleType,
              AccessStatus.DENIED,
              route,
              method,
              ip,
              userAgent,
            );
          }
        },
      }),
    );
  }

  private getModuleFromRoute(route: string): string | null {
    if (route.includes('/users')) return ModuleType.USER_MANAGEMENT;
    if (route.includes('/profile')) return ModuleType.PROFILE;
    if (route.includes('/financial')) return ModuleType.FINANCIAL;
    if (route.includes('/reports')) return ModuleType.REPORTS;
    if (route.includes('/products')) return ModuleType.PRODUCTS;
    return null;
  }

  private async logAccess(
    userId: string,
    moduleType: string,
    status: string,
    route: string,
    method: string,
    ip?: string,
    userAgent?: string,
  ) {
    try {
      const module = await this.prisma.module.findUnique({
        where: { type: moduleType },
      });

      if (module) {
        await this.prisma.accessLog.create({
          data: {
            userId,
            moduleId: module.id,
            accessStatus: status,
            route,
            method,
            ip,
            userAgent,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao registrar log de acesso:', error);
    }
  }
}