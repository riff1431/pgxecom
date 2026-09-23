import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private supabaseService: SupabaseService,
  ) {}

  async register(dto: RegisterDto) {
    const supabase = this.supabaseService.getAdminClient();

    // 1. Check if user already exists in local DB
    const existingLocal = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase().trim() },
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });

    if (existingLocal) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // 2. Create user in Supabase Auth if available
    let supabaseUserId: string = crypto.randomUUID();
    if (supabase) {
      try {
        const { data: sbUser, error: sbError } = await supabase.auth.admin.createUser({
          email: dto.email.toLowerCase().trim(),
          password: dto.password,
          email_confirm: true,
          user_metadata: {
            name: dto.name,
            role: 'fan',
          },
        });

        if (sbError) {
          if (sbError.message.includes('already registered') || sbError.message.includes('already exists')) {
            throw new ConflictException('An account with this email already exists on the PGX network.');
          }
          this.logger.error(`Supabase admin.createUser error: ${sbError.message}`);
          throw new BadRequestException(sbError.message);
        }

        if (sbUser?.user?.id) {
          supabaseUserId = sbUser.user.id;
        }
      } catch (err: any) {
        if (err instanceof ConflictException || err instanceof BadRequestException) {
          throw err;
        }
        this.logger.error('Error creating Supabase user:', err);
        throw new BadRequestException(err.message || 'Account registration failed');
      }

      // 3. Ensure user has a Supabase wallet initialized
      try {
        await supabase
          .from('wallets')
          .insert({ user_id: supabaseUserId, balance: 0, currency: 'EUR' })
          .select('id')
          .maybeSingle();
      } catch (wErr) {
        this.logger.warn('Could not initialize Supabase wallet (may already exist):', wErr);
      }
    }

    // 4. Hash password and save in local Prisma using the exact same Supabase UUID
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        id: supabaseUserId,
        name: dto.name,
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // 5. Generate both NestJS token and Supabase session token
    let supabaseToken = '';
    if (supabase) {
      try {
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email: dto.email.toLowerCase().trim(),
          password: dto.password,
        });
        supabaseToken = loginData.session?.access_token || '';
      } catch (e) {
        this.logger.warn('Could not get initial Supabase token on register:', e);
      }
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user,
      token,
      supabaseToken,
    };
  }

  async login(dto: LoginDto) {
    const supabase = this.supabaseService.getAdminClient();
    const cleanEmail = dto.email.toLowerCase().trim();

    // 1. Authenticate against Supabase Auth (if configured)
    let supabaseUser: any = null;
    let supabaseToken = '';

    if (supabase) {
      try {
        const { data: sbAuth, error: sbError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: dto.password,
        });

        if (!sbError && sbAuth.user) {
          supabaseUser = sbAuth.user;
          supabaseToken = sbAuth.session?.access_token || '';
        }
      } catch (e) {
        this.logger.warn('Supabase signInWithPassword check failed:', e);
      }
    }

    // 2. Fetch local user
    let user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // If password matched in Supabase but user does not exist locally yet (account created on adult site)
    if (supabaseUser && !user) {
      const hashedPassword = await bcrypt.hash(dto.password, 12);
      const name =
        supabaseUser.user_metadata?.name ||
        supabaseUser.user_metadata?.full_name ||
        cleanEmail.split('@')[0];

      user = await this.prisma.user.create({
        data: {
          id: supabaseUser.id,
          name,
          email: cleanEmail,
          password: hashedPassword,
          role: 'CUSTOMER',
        },
      });
      this.logger.log(`Auto-provisioned local customer profile for Supabase user ${supabaseUser.id}`);
    }

    // If not authenticated via Supabase, fallback to check local Prisma password
    if (!supabaseUser) {
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is in Supabase; if not, sync them to Supabase
      if (supabase) {
        try {
          const { data: createdSb } = await supabase.auth.admin.createUser({
            email: cleanEmail,
            password: dto.password,
            email_confirm: true,
            user_metadata: { name: user.name, role: 'fan' },
          });

          if (createdSb?.user) {
            const { data: sessionData } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: dto.password,
            });
            supabaseToken = sessionData.session?.access_token || '';
          }
        } catch (syncErr) {
          this.logger.warn('Background Supabase user sync error during local login:', syncErr);
        }
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Your account has been suspended. Please contact support.');
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
      token,
      supabaseToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    const resetUrl = `${this.configService.get('FRONTEND_URL')}/new-password?token=${resetToken}`;

    try {
      await this.mailService.sendPasswordReset(user.email, user.name, resetUrl);
    } catch (error) {
      console.error('Failed to send reset email:', error);
    }

    return { message: 'If this email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  private generateToken(userId: string, role: string): string {
    return this.jwtService.sign({
      sub: userId,
      role,
    });
  }
}
