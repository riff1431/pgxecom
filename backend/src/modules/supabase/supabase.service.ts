import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private adminClient: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && serviceRoleKey) {
      this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.logger.log('Supabase Admin Client initialized successfully');
    } else {
      this.logger.warn('Supabase credentials missing in environment variables');
    }
  }

  isAvailable(): boolean {
    return this.adminClient !== null;
  }

  getAdminClient(): SupabaseClient | null {
    return this.adminClient;
  }
}
