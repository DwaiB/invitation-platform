import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [SupabaseAuthGuard],
})
export class AuthModule {}
