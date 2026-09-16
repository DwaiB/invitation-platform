import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { SupabaseService } from '../supabase/supabase.service.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  check() {
    const dbStatus = this.databaseService.getHealthStatus();
    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      database: dbStatus,
      supabase: this.supabaseService.isConfigured() ? 'configured' : 'not-configured',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
