import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getUsersReport() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            permissions: true,
            accessLogs: true,
          },
        },
      },
    });

    const summary = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      inactiveUsers: users.filter(u => !u.isActive).length,
      roleDistribution: {
        SUPERUSER: users.filter(u => u.role === 'SUPERUSER').length,
        ADMIN: users.filter(u => u.role === 'ADMIN').length,
        USER: users.filter(u => u.role === 'USER').length,
      },
    };

    return {
      summary,
      users: users.map(user => ({
        ...user,
        permissionsCount: user._count.permissions,
        accessLogsCount: user._count.accessLogs,
        _count: undefined,
      })),
    };
  }

  async getAccessReport() {
    const accessLogs = await this.prisma.accessLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        module: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100, // Últimos 100 acessos
    });

    const summary = {
      totalAccesses: accessLogs.length,
      grantedAccesses: accessLogs.filter(log => log.accessStatus === 'GRANTED').length,
      deniedAccesses: accessLogs.filter(log => log.accessStatus === 'DENIED').length,
      moduleAccesses: {},
    };

    // Contar acessos por módulo
    accessLogs.forEach(log => {
      const moduleType = log.module.type;
      if (!summary.moduleAccesses[moduleType]) {
        summary.moduleAccesses[moduleType] = {
          granted: 0,
          denied: 0,
          total: 0,
        };
      }
      summary.moduleAccesses[moduleType].total++;
      if (log.accessStatus === 'GRANTED') {
        summary.moduleAccesses[moduleType].granted++;
      } else {
        summary.moduleAccesses[moduleType].denied++;
      }
    });

    return {
      summary,
      recentAccesses: accessLogs,
    };
  }

  async getPermissionsReport() {
    const permissions = await this.prisma.userPermission.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        module: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    const modules = await this.prisma.module.findMany();
    
    const summary = {
      totalPermissions: permissions.length,
      permissionsByModule: {},
      usersWithPermissions: new Set(permissions.map(p => p.userId)).size,
    };

    // Contar permissões por módulo
    modules.forEach(module => {
      const modulePermissions = permissions.filter(p => p.moduleId === module.id);
      summary.permissionsByModule[module.type] = {
        moduleName: module.name,
        permissionsCount: modulePermissions.length,
        users: modulePermissions.map(p => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          role: p.user.role,
          grantedAt: p.createdAt,
        })),
      };
    });

    return {
      summary,
      detailedPermissions: summary.permissionsByModule,
    };
  }
}