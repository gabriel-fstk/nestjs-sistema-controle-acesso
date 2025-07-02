# Sistema de Controle de Acesso

Sistema desenvolvido com NestJS, Prisma e SQLite para gerenciamento de permissões de acesso a módulos fixos. Este sistema implementa controle de acesso baseado em papéis e permissões específicas por módulo.

## 📋 Sumário

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Execução](#execução)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Módulos do Sistema](#módulos-do-sistema)
- [API Endpoints](#api-endpoints)
- [Autenticação](#autenticação)
- [Sistema de Permissões](#sistema-de-permissões)
- [Testes](#testes)
- [Documentação da API](#documentação-da-api)

## 🚀 Características

### Funcionalidades Principais
- ✅ **Autenticação JWT** com criptografia de senhas usando bcrypt
- ✅ **Sistema de Papéis**: Superusuário, Administrador e Usuário comum
- ✅ **Controle de Permissões** por módulos específicos
- ✅ **Log de Acessos** - registro de todas as tentativas de acesso
- ✅ **Módulos Fixos** com regras de negócio específicas
- ✅ **Middleware de Segurança** para verificação de permissões em tempo real
- ✅ **CRUD completo** para usuários e permissões
- ✅ **Relatórios** de acessos, usuários e permissões

### Módulos Fixos Implementados
1. **Gestão de Usuários** - Apenas Admin e Superusuário
2. **Perfil** - Todos os usuários (seus próprios dados)
3. **Financeiro** - Superusuário, Admin e usuários com permissão explícita
4. **Relatórios** - Superusuário, Admin e usuários com permissão explícita
5. **Produtos** - Superusuário, Admin e usuários com permissão explícita

## 🏠 Tecnologias

- **[NestJS](https://nestjs.com/)** - Framework Node.js para APIs robustas
- **[Prisma](https://www.prisma.io/)** - ORM moderno para TypeScript
- **[SQLite](https://www.sqlite.org/)** - Banco de dados local
- **[JWT](https://jwt.io/)** - Autenticação baseada em tokens
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Criptografia de senhas
- **[Swagger](https://swagger.io/)** - Documentação automática da API
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem tipada

## 🏗 Arquitetura

O sistema segue a arquitetura modular do NestJS:

```
src/
├── auth/                 # Módulo de autenticação
├── users/                # Gestão de usuários
├── permissions/          # Sistema de permissões
├── profile/              # Módulo de perfil
├── financial/            # Módulo financeiro
├── reports/              # Módulo de relatórios
├── products/             # Módulo de produtos
├── access-log/           # Log de acessos
└── shared/
    ├── decorators/       # Decorators customizados
    ├── guards/           # Guards de segurança
    ├── interceptors/     # Interceptors
    └── prisma/           # Configuração do Prisma
```

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sistema-controle-acesso
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Gerar o cliente Prisma
npm run prisma:generate

# Criar/sincronizar o banco de dados
npm run prisma:push

# Executar seed (criar superusuário e módulos)
npm run prisma:seed
```

## 🚀 Execução

### Desenvolvimento
```bash
# Modo desenvolvimento com hot-reload
npm run start:dev
```

### Produção
```bash
# Build da aplicação
npm run build

# Executar em produção
npm run start:prod
```

### Outras opções
```bash
# Modo debug
npm run start:debug

# Executar testes
npm run test

# Executar testes com coverage
npm run test:cov

# Abrir Prisma Studio (visualizar dados)
npm run prisma:studio
```

A aplicação estará disponível em:
- **API**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api

## 🗄 Estrutura do Banco de Dados

### Entidades Principais

#### Users (Usuários)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Modules (Módulos)
```prisma
model Module {
  id          String     @id @default(cuid())
  name        String     @unique
  type        ModuleType @unique
  description String?
  isActive    Boolean    @default(true)
}
```

#### UserPermissions (Permissões)
```prisma
model UserPermission {
  id       String @id @default(cuid())
  userId   String
  moduleId String
  user     User   @relation(fields: [userId], references: [id])
  module   Module @relation(fields: [moduleId], references: [id])
}
```

#### AccessLogs (Logs de Acesso)
```prisma
model AccessLog {
  id           String       @id @default(cuid())
  userId       String
  moduleId     String
  accessStatus AccessStatus
  route        String
  method       String
  ip           String?
  userAgent    String?
  timestamp    DateTime     @default(now())
}
```

### Enums
- **UserRole**: `SUPERUSER`, `ADMIN`, `USER`
- **ModuleType**: `USER_MANAGEMENT`, `PROFILE`, `FINANCIAL`, `REPORTS`, `PRODUCTS`
- **AccessStatus**: `GRANTED`, `DENIED`

## 🔐 Autenticação

### Credenciais Padrão
Após executar o seed, use estas credenciais para fazer login:

```json
{
  "email": "superuser@sistema.com",
  "password": "SuperUser123!"
}
```

### Processo de Login
1. **POST** `/auth/login` com email e senha
2. Receba o token JWT na resposta
3. Use o token no header: `Authorization: Bearer <token>`

### Exemplo de Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superuser@sistema.com",
    "password": "SuperUser123!"
  }'
```

## 🛡 Sistema de Permissões

### Hierarquia de Papéis

1. **SUPERUSER**
   - Acesso total a todos os módulos
   - Pode criar administradores
   - Não pode ser removido

2. **ADMIN**
   - Acesso a todos os módulos exceto USER_MANAGEMENT*
   - Pode criar usuários comuns
   - Pode gerenciar permissões

3. **USER**
   - Acesso apenas ao módulo PROFILE
   - Acesso a outros módulos mediante permissão explícita

*USER_MANAGEMENT é acessível apenas por ADMIN e SUPERUSER

### Regras de Negócio

#### Módulo de Gestão de Usuários
- ✅ SUPERUSER: Acesso total
- ✅ ADMIN: Acesso total (exceto criar outros admins)
- ❌ USER: Sem acesso

#### Módulo de Perfil
- ✅ Todos os usuários podem acessar e editar seu próprio perfil

#### Módulos Financeiro, Relatórios e Produtos
- ✅ SUPERUSER: Acesso automático
- ✅ ADMIN: Acesso automático
- ⚠️ USER: Apenas com permissão explícita

## 📡 API Endpoints

### Autenticação
```http
POST   /auth/login                 # Realizar login
```

### Usuários
```http
GET    /users                      # Listar usuários
POST   /users                      # Criar usuário
GET    /users/:id                  # Buscar usuário
PATCH  /users/:id                  # Atualizar usuário
DELETE /users/:id                  # Desativar usuário
```

### Permissões
```http
POST   /permissions/grant          # Conceder permissão
DELETE /permissions/revoke/:userId/:moduleType # Revogar permissão
GET    /permissions/user/:userId   # Listar permissões do usuário
GET    /permissions                # Listar todas as permissões
```

### Perfil
```http
GET    /profile                    # Obter perfil do usuário logado
PATCH  /profile                    # Atualizar perfil
```

### Módulos de Negócio
```http
# Financeiro
GET    /financial/dashboard        # Dashboard financeiro
GET    /financial/transactions     # Transações

# Relatórios
GET    /reports/users              # Relatório de usuários
GET    /reports/access             # Relatório de acessos
GET    /reports/permissions        # Relatório de permissões

# Produtos
GET    /products                   # Listar produtos
POST   /products                   # Criar produto
GET    /products/:id               # Buscar produto
PATCH  /products/:id               # Atualizar produto
DELETE /products/:id               # Remover produto
```

### Logs de Acesso
```http
GET    /access-logs                # Listar logs (paginado)
GET    /access-logs/user           # Logs do usuário logado
GET    /access-logs/statistics     # Estatísticas de acesso
```

## 🧪 Testes

### Testando Permissões

1. **Faça login como superusuário**
2. **Crie um usuário comum**
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "name": "Usuário Teste",
    "password": "password123",
    "role": "USER"
  }'
```

3. **Teste acesso negado**
```bash
# Login como usuário comum
# Tente acessar módulo financeiro (deve ser negado)
curl -X GET http://localhost:3000/financial/dashboard \
  -H "Authorization: Bearer <user-token>"
```

4. **Conceda permissão**
```bash
curl -X POST http://localhost:3000/permissions/grant \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<user-id>",
    "moduleType": "FINANCIAL"
  }'
```

### Testando Log de Acessos

Todos os acessos são automaticamente registrados. Verifique os logs:

```bash
curl -X GET http://localhost:3000/access-logs/statistics \
  -H "Authorization: Bearer <admin-token>"
```

## 📚 Documentação da API

Acesse a documentação interativa do Swagger:
- **URL**: http://localhost:3000/api
- **Recursos**: Teste todos os endpoints diretamente no navegador
- **Autenticação**: Use o botão "Authorize" para inserir o JWT token

> **Para importar a especificação no Postman:**  
> Acesse [http://localhost:3000/api-json](http://localhost:3000/api-json), salve o conteúdo como `swagger.json` e importe no Postman usando "Import > File".

## 🔍 Exemplos de Uso

### Cenário Completo

1. **Login como Superusuário**
```json
POST /auth/login
{
  "email": "superuser@sistema.com",
  "password": "SuperUser123!"
}
```

2. **Criar Administrador**
```json
POST /users
{
  "email": "admin@empresa.com",
  "name": "Administrador",
  "password": "admin123",
  "role": "ADMIN"
}
```

3. **Criar Usuário Comum**
```json
POST /users  
{
  "email": "funcionario@empresa.com",
  "name": "Funcionário",
  "password": "func123",
  "role": "USER"
}
```

4. **Conceder Permissão ao Funcionário**
```json
POST /permissions/grant
{
  "userId": "<funcionario-id>",
  "moduleType": "FINANCIAL"
}
```

5. **Verificar Logs de Acesso**
```http
GET /access-logs/statistics
```

## ⚠️ Tratamento de Erros

### Mensagens de Erro Padronizadas

- **401 Unauthorized**: Token inválido ou expirado
- **403 Forbidden**: 
  - "SEM PERMISSÃO PARA ACESSAR O MÓDULO X"
  - "Apenas administradores podem criar usuários"
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Email já está em uso

### Logs de Segurança

Todos os acessos negados são registrados automaticamente no banco de dados para auditoria.

## 🛠 Configuração Avançada

### Variáveis de Ambiente
Crie um arquivo `.env` para configurações personalizadas:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-jwt-secret-muito-seguro"
PORT=3000
```

### Personalizações

- **Tempo de expiração do JWT**: Altere em `auth.module.ts`
- **Regras de senha**: Modifique validators nos DTOs
- **Estrutura do banco**: Edite `schema.prisma` e execute `prisma db push`

## 📖 Conclusão

Este sistema implementa um controle de acesso robusto e flexível, seguindo as melhores práticas de segurança e arquitetura. O código é bem estruturado, documentado e facilmente extensível para novos módulos e funcionalidades.

### Recursos Implementados

✅ Autenticação JWT segura  
✅ Sistema de papéis hierárquico  
✅ Controle de permissões granular  
✅ Log completo de acessos  
✅ API RESTful bem documentada  
✅ Middleware de segurança  
✅ Seed automático de dados  
✅ Documentação Swagger  

O sistema está pronto para uso em ambiente de produção com as devidas configurações de segurança e deploy.