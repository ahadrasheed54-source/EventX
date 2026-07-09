import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Simply delegates to the 'jwt' passport strategy defined in auth/strategies
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
