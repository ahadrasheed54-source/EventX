import { SetMetadata } from '@nestjs/common';

export type UserRole = 'admin' | 'organizer' | 'participant';

export const ROLES_KEY = 'roles';

// Usage: @Roles('admin', 'organizer') above a controller method
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
