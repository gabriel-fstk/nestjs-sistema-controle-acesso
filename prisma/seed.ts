import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRole, ModuleType } from '../src/shared/constants/enums';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar módulos fixos
  const modules = [
    {
      name: 'Gestão de Usuários',
      type: ModuleType.USER_MANAGEMENT,
      description: 'Módulo para gerenciamento de usuários do sistema',
    },
    {
      name: 'Perfil',
      type: ModuleType.PROFILE,
      description: 'Módulo de perfil pessoal do usuário',
    },
    {
      name: 'Financeiro',
      type: ModuleType.FINANCIAL,
      description: 'Módulo financeiro do sistema',
    },
    {
      name: 'Relatórios',
      type: ModuleType.REPORTS,
      description: 'Módulo de relatórios e análises',
    },
    {
      name: 'Produtos',
      type: ModuleType.PRODUCTS,
      description: 'Módulo de gestão de produtos',
    },
  ];

  console.log('📦 Criando módulos...');
  for (const moduleData of modules) {
    await prisma.module.upsert({
      where: { type: moduleData.type },
      update: {},
      create: moduleData,
    });
  }

  // Criar superusuário
  const superUserEmail = 'superuser@sistema.com';
  const hashedPassword = await bcrypt.hash('SuperUser123!', 10);

  console.log('👑 Criando superusuário...');
  const superUser = await prisma.user.upsert({
    where: { email: superUserEmail },
    update: {},
    create: {
      email: superUserEmail,
      password: hashedPassword,
      name: 'Super Usuário',
      role: UserRole.SUPERUSER,
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`Superusuário criado: ${superUser.email}`);
  console.log('Senha: SuperUser123!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });