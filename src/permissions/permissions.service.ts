import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { ModuleType, UserRole } from '../shared/constants/enums';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async grantPermission(userId: string, moduleType: string, grantedBy: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o módulo existe
    const module = await this.prisma.module.findUnique({
      where: { type: moduleType },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    // Verificar se a permissão já existe
    const existingPermission = await this.prisma.userPermission.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId: module.id,
        },
      },
    });

    if (existingPermission) {
      return { message: 'Usuário já possui essa permissão' };
    }

    // Criar a permissão
    await this.prisma.userPermission.create({
      data: {
        userId,
        moduleId: module.id,
      },
    });

    return { message: 'Permissão concedida com sucesso' };
  }

  async revokePermission(userId: string, moduleType: string) {
    const module = await this.prisma.module.findUnique({
      where: { type: moduleType },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    const permission = await this.prisma.userPermission.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId: module.id,
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    await this.prisma.userPermission.delete({
      where: {
        id: permission.id,
      },
    });

    return { message: 'Permissão revogada com sucesso' };
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      permissions: user.permissions.map(p => ({
        id: p.id,
        module: {
          id: p.module.id,
          name: p.module.name,
          type: p.module.type,
        },
        createdAt: p.createdAt,
      })),
    };
  }

  async checkUserPermission(userId: string, moduleType: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    // Superusuário tem acesso a tudo
    if (user.role === UserRole.SUPERUSER) {
      return true;
    }

    // Admin tem acesso a tudo exceto USER_MANAGEMENT (que já foi verificado acima)
    if (user.role === UserRole.ADMIN && moduleType !== ModuleType.USER_MANAGEMENT) {
      return true;
    }

    // USER_MANAGEMENT é apenas para Admin e Superuser
    if (moduleType === ModuleType.USER_MANAGEMENT) {
      return user.role === UserRole.ADMIN || user.role === UserRole.SUPERUSER;
    }

    // PROFILE é acessível por todos
    if (moduleType === ModuleType.PROFILE) {
      return true;
    }

    // Para outros módulos, verificar permissões específicas
    const hasPermission = user.permissions.some(
      permission => permission.module.type === moduleType
    );

    return hasPermission;
  }

  async listAllPermissions() {
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
        module: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return permissions;
  }
}