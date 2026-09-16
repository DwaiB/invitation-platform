import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { UsersService } from '../../users/users.service.js';
import { AuthenticatedRequest } from '../auth.types.js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly jwksUrl: string;
  private readonly issuer: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const supabaseUrl = config.get<string>('supabase.url');
    this.jwksUrl = config.get<string>('supabase.jwksUrl') || `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
    this.issuer = `${supabaseUrl}/auth/v1`;
    this.jwks = createRemoteJWKSet(new URL(this.jwksUrl));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: 'authenticated',
      });
      request.user = await this.usersService.findOrCreate(this.toIdentity(payload));
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private toIdentity(payload: JWTPayload) {
    const metadata = payload.user_metadata as Record<string, unknown> | undefined;
    return {
      id: payload.sub || '',
      email: typeof payload.email === 'string' ? payload.email : undefined,
      name: typeof metadata?.full_name === 'string' ? metadata.full_name : undefined,
      avatarUrl: typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : undefined,
    };
  }
}
