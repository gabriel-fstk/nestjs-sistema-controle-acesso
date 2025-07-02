import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class AccessLogService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.accessLog.findMany({
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
        skip,
        take: limit,
      }),
      this.prisma.accessLog.count(),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: string) {
    return this.prisma.accessLog.findMany({
      where: { userId },
      include: {
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
      take: 100,
    });
  }

  async getStatistics() {
    const [totalLogs, grantedAccesses, deniedAccesses] = await Promise.all([
      this.prisma.accessLog.count(),
      this.prisma.accessLog.count({ where: { accessStatus: 'GRANTED' } }),
      this.prisma.accessLog.count({ where: { accessStatus: 'DENIED' } }),
    ]);

    return {
      totalLogs,
      grantedAccesses,
      deniedAccesses,
      successRate: totalLogs > 0 ? (grantedAccesses / totalLogs) * 100 : 0,
    };
  }
}