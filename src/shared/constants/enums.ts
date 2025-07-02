// Constantes para substituir os enums do Prisma
export const UserRole = {
  SUPERUSER: 'SUPERUSER',
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const;

export const ModuleType = {
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  PROFILE: 'PROFILE',
  FINANCIAL: 'FINANCIAL',
  REPORTS: 'REPORTS',
  PRODUCTS: 'PRODUCTS'
} as const;

export const AccessStatus = {
  GRANTED: 'GRANTED',
  DENIED: 'DENIED'
} as const;

// Tipos TypeScript derivados das constantes
export type UserRole = typeof UserRole[keyof typeof UserRole];
export type ModuleType = typeof ModuleType[keyof typeof ModuleType];
export type AccessStatus = typeof AccessStatus[keyof typeof AccessStatus];