import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Usage: findMine(@CurrentUser() user) inside a controller method
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // set by JwtAuthGuard/JwtStrategy
  },
);
