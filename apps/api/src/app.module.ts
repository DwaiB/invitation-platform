import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import configuration from './config/configuration.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { AuthModule } from './auth/auth.module.js';
import { InvitationsModule } from './invitations/invitations.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      // Always load the repository-level .env first, regardless of whether
      // Nest is started directly from apps/api or through Turbo.
      envFilePath: [join(import.meta.dirname, '../../../.env')],
      validate: (env) => {
        const required = ['MONGODB_URI'];
        const missing = required.filter((name) => !env[name]);
        if (missing.length > 0) {
          throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        return env;
      },
    }),
    DatabaseModule,
    SupabaseModule,
    AuthModule,
    InvitationsModule,
    HealthModule,
  ],
})
export class AppModule { }
