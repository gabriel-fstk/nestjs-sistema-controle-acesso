# 🛡️ Sistema de Guards e Segurança

## 📋 Arquitetura de Segurança

### 1. **Guards Implementados**

#### 🔐 **JwtAuthGuard** (Autenticação Global)
```typescript
// Aplicado globalmente em app.module.ts
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

**Função:** Verifica se o usuário está autenticado (possui token JWT válido)
- ✅ **Permite**: Rotas marcadas com `@Public()`
- ❌ **Bloqueia**: Todas as outras rotas sem token válido

#### 🔒 **PermissionGuard** (Autorização por Módulo)
```typescript
@UseGuards(PermissionGuard)
@RequirePermission(ModuleType.FINANCIAL)
```

**Função:** Verifica se o usuário tem permissão para acessar um módulo específico
- ✅ **Consulta**: Banco de dados em tempo real
- ✅ **Aplica**: Regras de hierarquia de papéis
- ❌ **Bloqueia**: Acesso não autorizado

### 2. **Fluxo de Segurança**

```
Requisição → JwtAuthGuard → Token Válido? 
    ↓ Não                    ↓ Sim
401 Unauthorized    PermissionGuard → Tem Permissão?
                        ↓ Não              ↓ Sim
                403 Forbidden + Log    Acesso Liberado + Log
```

### 3. **Decorators Customizados**

#### `@Public()`
```typescript
@Public()
@Post('login')
```
- **Uso**: Libera rota da autenticação JWT
- **Aplicação**: Login, registro, rotas públicas

#### `@RequirePermission(ModuleType)`
```typescript
@RequirePermission(ModuleType.FINANCIAL)
```
- **Uso**: Define qual módulo precisa de permissão
- **Verificação**: Automática pelo PermissionGuard

#### `@CurrentUser()`
```typescript
async create(@CurrentUser() user: any)
```
- **Uso**: Injeta dados do usuário logado
- **Dados**: ID, email, role, name do JWT

---

# 🎯 Resumo do Sistema

## 📊 **Visão Geral**

### **Objetivo**
Sistema de controle de acesso granular com **5 módulos fixos** e **3 níveis hierárquicos** de usuários.

### **Tecnologias**
- **Backend**: NestJS + TypeScript
- **Banco**: SQLite + Prisma ORM  
- **Segurança**: JWT + bcrypt
- **Documentação**: Swagger automático

## 🏗️ **Arquitetura Modular**

### **Módulos Implementados**
1. **👥 Gestão de Usuários** - Admin/Superuser apenas
2. **👤 Perfil** - Todos os usuários (próprios dados)
3. **💰 Financeiro** - Hierarquia + permissões explícitas
4. **📊 Relatórios** - Hierarquia + permissões explícitas  
5. **📦 Produtos** - Hierarquia + permissões explícitas

### **Hierarquia de Papéis**
```
🔴 SUPERUSER
├── Acesso total a tudo
├── Pode criar ADMINs
└── Não pode ser removido

🟡 ADMIN  
├── Acesso a todos módulos (exceto USER_MANAGEMENT*)
├── Pode criar USERs
└── Pode gerenciar permissões

🟢 USER
├── Acesso apenas ao PROFILE
└── Outros módulos via permissão explícita
```

*USER_MANAGEMENT é acessível por Admin e Superuser

## 🔐 **Sistema de Segurança**

### **Dupla Camada de Proteção**
1. **Autenticação** → JWT válido?
2. **Autorização** → Tem permissão para este módulo?

### **Auditoria Completa**
- ✅ **Todos os acessos** são logados
- ✅ **Sucessos e falhas** registrados
- ✅ **Metadados**: IP, User-Agent, timestamp

### **Regras de Negócio**
- 🚫 **USER_MANAGEMENT**: Apenas Admin/Superuser
- ✅ **PROFILE**: Todos (próprios dados)
- ⚠️ **Outros módulos**: Hierarquia + permissões explícitas

## 🔄 **Interceptors e Middleware**

### **AccessLogInterceptor**
```typescript
@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  // Registra automaticamente todos os acessos
  // Tanto sucessos quanto falhas (403)
}
```

**Funcionalidades:**
- 📝 **Log automático** de todas as requisições
- 🎯 **Detecção de módulo** baseada na rota
- 📊 **Metadados completos** (IP, User-Agent, método HTTP)
- ⚡ **Não bloqueia** a execução da aplicação

---

# 🗄️ Organização do Schema.prisma

## 📋 **Estrutura do Banco**

### **1. Entidades Principais**

#### **👤 Users (Usuários)**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  name      String
  role      String   @default("USER") // SUPERUSER, ADMIN, USER
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relacionamentos
  permissions UserPermission[]
  accessLogs  AccessLog[]
  createdBy   User?   @relation("UserCreatedBy", fields: [createdById], references: [id])
  createdById String?
  createdUsers User[] @relation("UserCreatedBy")
}
```

**Características:**
- 🔑 **CUID**: IDs únicos e seguros
- 🔒 **bcrypt**: Senhas criptografadas
- 📊 **Soft Delete**: isActive em vez de deletar
- 🔗 **Self-Reference**: Rastreabilidade de criação

#### **📦 Modules (Módulos)**
```prisma
model Module {
  id          String   @id @default(cuid())
  name        String   @unique
  type        String   @unique // USER_MANAGEMENT, PROFILE, etc.
  description String?
  isActive    Boolean  @default(true)
  
  // Relacionamentos
  permissions UserPermission[]
  accessLogs  AccessLog[]
}
```

**Características:**
- 🎯 **Tipos fixos**: Definidos via seed
- 📝 **Descritivos**: Nome e descrição legíveis
- 🔄 **Extensível**: Fácil adicionar novos módulos

### **2. Tabelas de Relacionamento**

#### **🔗 UserPermission (Permissões)**
```prisma
model UserPermission {
  id       String @id @default(cuid())
  userId   String
  moduleId String
  
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, moduleId]) // Evita duplicatas
}
```

**Características:**
- 🚫 **Sem duplicatas**: Constraint única
- 🗑️ **Cascade Delete**: Limpeza automática
- 📅 **Timestamps**: Auditoria de criação/modificação

#### **📝 AccessLog (Auditoria)**
```prisma
model AccessLog {
  id           String   @id @default(cuid())
  userId       String
  moduleId     String
  accessStatus String   // GRANTED, DENIED
  route        String
  method       String
  ip           String?
  userAgent    String?
  timestamp    DateTime @default(now())
  
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)
}
```

**Características:**
- 📊 **Auditoria completa**: Todos os acessos registrados
- 🌐 **Metadados de rede**: IP e User-Agent
- ⏰ **Timestamp automático**: Momento exato do acesso
- 🎯 **Status detalhado**: GRANTED ou DENIED

## 🎯 **Decisões de Design**

### **Por que SQLite + String em vez de Enums?**
- ✅ **Simplicidade**: Sem configuração de servidor
- ✅ **Compatibilidade**: SQLite não suporta enums nativos
- ✅ **Flexibilidade**: Fácil de estender valores
- ✅ **Portabilidade**: Funciona em qualquer ambiente

### **Relacionamentos Implementados**
- **1:N** → User → UserPermissions
- **1:N** → Module → UserPermissions  
- **N:N** → User ↔ Module (via UserPermission)
- **1:N** → User → AccessLogs (auditoria)
- **Self-Reference** → User.createdBy (rastreabilidade)

### **Índices e Constraints**
- ✅ **@unique([userId, moduleId])** → Evita permissões duplicadas
- ✅ **@unique** em email e module.type → Integridade
- ✅ **onDelete: Cascade** → Limpeza automática

## 📈 **Escalabilidade**

### **Preparado para Crescimento**
- 🔄 **Fácil migração** para PostgreSQL/MySQL
- 📊 **Logs estruturados** para análise
- 🔧 **Módulos extensíveis** via seed
- 🛡️ **Segurança robusta** desde o início

---

# 🔧 **Implementação Técnica**

## **Guards em Ação**

### **1. Configuração Global (app.module.ts)**
```typescript
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Autenticação global
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AccessLogInterceptor, // Log automático
    },
  ],
})
export class AppModule {}
```

### **2. Uso em Controllers**
```typescript
@ApiTags('financial')
@Controller('financial')
@UseGuards(PermissionGuard) // Autorização específica
@RequirePermission(ModuleType.FINANCIAL) // Módulo requerido
export class FinancialController {
  
  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    // user já está autenticado e autorizado
    return this.financialService.getDashboard();
  }
}
```

### **3. Lógica de Permissões (permissions.service.ts)**
```typescript
async checkUserPermission(userId: string, moduleType: string): Promise<boolean> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { permissions: { include: { module: true } } }
  });

  // Superusuário tem acesso a tudo
  if (user.role === UserRole.SUPERUSER) return true;
  
  // Admin tem acesso a tudo exceto USER_MANAGEMENT
  if (user.role === UserRole.ADMIN && moduleType !== ModuleType.USER_MANAGEMENT) {
    return true;
  }
  
  // USER_MANAGEMENT é apenas para Admin e Superuser
  if (moduleType === ModuleType.USER_MANAGEMENT) {
    return user.role === UserRole.ADMIN || user.role === UserRole.SUPERUSER;
  }
  
  // PROFILE é acessível por todos
  if (moduleType === ModuleType.PROFILE) return true;
  
  // Para outros módulos, verificar permissões específicas
  return user.permissions.some(p => p.module.type === moduleType);
}
```

## **Fluxo Completo de Segurança**

1. **Requisição chega** → `JwtAuthGuard` verifica token
2. **Token válido** → `PermissionGuard` verifica permissão
3. **Permissão OK** → `AccessLogInterceptor` registra sucesso
4. **Permissão negada** → `AccessLogInterceptor` registra falha + 403

Este sistema implementa **todas as melhores práticas** de segurança e organização, sendo facilmente **extensível e mantível**! 🚀

---

# 📚 **Referências e Boas Práticas**

## **Padrões Implementados**
- ✅ **Guard Pattern**: Proteção de rotas
- ✅ **Decorator Pattern**: Metadados de permissão
- ✅ **Interceptor Pattern**: Cross-cutting concerns
- ✅ **Repository Pattern**: Acesso a dados via Prisma
- ✅ **DTO Pattern**: Validação de entrada

## **Segurança Implementada**
- 🔐 **JWT**: Tokens stateless
- 🔒 **bcrypt**: Hash de senhas
- 🛡️ **Guards**: Dupla camada de proteção
- 📝 **Audit Log**: Rastreabilidade completa
- 🚫 **Principle of Least Privilege**: Acesso mínimo necessário

Este sistema está **pronto para produção** e segue todas as **melhores práticas** da indústria! 🎯