import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../shared/constants/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, createdBy?: string) {
    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        createdById: createdBy,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          include: {
            module: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        permissions: {
          include: {
            module: true,
          },
        },
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedBy: string) {
    const user = await this.findOne(id);

    // Verificar se é superuser tentando ser alterado por não-superuser
    if (user.role === UserRole.SUPERUSER) {
      const updater = await this.findOne(updatedBy);
      if (updater.role !== UserRole.SUPERUSER) {
        throw new ForbiddenException('Apenas superusuário pode alterar superusuário');
      }
    }

    const updateData: any = { ...updateUserDto };

    // Se estiver alterando a senha, fazer hash
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, deletedBy: string) {
    const user = await this.findOne(id);

    // Não permitir deletar superusuário
    if (user.role === UserRole.SUPERUSER) {
      throw new ForbiddenException('Superusuário não pode ser removido');
    }

    // Verificar se o usuário que está deletando tem permissão
    const deleter = await this.findOne(deletedBy);
    if (deleter.role === UserRole.USER) {
      throw new ForbiddenException('Usuários comuns não podem deletar outros usuários');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }
}