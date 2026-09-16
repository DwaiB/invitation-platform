import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client?: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('supabase.url');
    const secretKey = this.config.get<string>('supabase.secretKey');

    if (url && secretKey) {
      this.client = createClient(url, secretKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.',
      );
    }

    return this.client;
  }

  isConfigured(): boolean {
    return Boolean(this.client);
  }
}
