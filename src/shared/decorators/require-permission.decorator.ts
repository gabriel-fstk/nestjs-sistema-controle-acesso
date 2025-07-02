import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (moduleType: string) =>
  SetMetadata(PERMISSION_KEY, moduleType);