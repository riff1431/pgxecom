import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../../modules/supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    // 1. Try verifying as local NestJS JWT first (this is what frontend axios sends via cookie token)
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      if (decoded && (decoded.sub || decoded.id)) {
        request.user = {
          id: decoded.sub || decoded.id,
          role: decoded.role,
          email: decoded.email,
        };
        return true;
      }
    } catch (localJwtErr: any) {
      // Not a valid local NestJS JWT, proceed to verify as Supabase JWT
    }

    // 2. Try verifying as Supabase token
    try {
      const supabase = this.supabaseService.getAdminClient();
      if (!supabase) {
        throw new UnauthorizedException('Authentication provider unavailable and local token invalid');
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && user) {
        request.user = {
          id: user.id,
          email: user.email,
          phone: user.phone,
          user_metadata: user.user_metadata,
          app_metadata: user.app_metadata,
        };
        return true;
      }

      this.logger.warn(`Token verification failed: ${error?.message || 'Invalid token'}`);
      throw new UnauthorizedException(error?.message || 'Invalid or expired token');
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException(err.message || 'Authentication failed');
    }
  }
}
