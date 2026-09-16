import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service.js';
import type { AuthenticatedRequest } from './auth.types.js';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';
import { ConfirmEmailDto, ForgotPasswordDto, LoginDto, RefreshDto, ResetPasswordDto } from './auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at,
      user: data.user,
    };
  }

  @Post('signup')
  async signup(@Body() body: LoginDto) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          emailRedirectTo: `${this.config.get<string>('webUrl')}/auth/confirm`,
        },
      });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      accessToken: data.session?.access_token ?? null,
      refreshToken: data.session?.refresh_token ?? null,
      expiresIn: data.session?.expires_in ?? null,
      expiresAt: data.session?.expires_at ?? null,
      emailConfirmationRequired: !data.session,
      user: data.user,
    };
  }

  @Post('confirm-email')
  async confirmEmail(@Body() body: ConfirmEmailDto) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.verifyOtp({ token_hash: body.tokenHash, type: 'email' });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid or expired confirmation link');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at,
      user: data.user,
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const { error } = await this.supabase.getClient().auth.resetPasswordForEmail(body.email, {
      redirectTo: `${this.config.get<string>('webUrl')}/auth/reset-password`,
    });
    if (error) throw new UnauthorizedException('Unable to send password reset email');
    return { message: 'If an account exists, a password reset email has been sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const client = this.supabase.getClient();
    const { data: verified, error: verifyError } = await client.auth.verifyOtp({
      token_hash: body.tokenHash,
      type: 'recovery',
    });
    if (verifyError || !verified.session) throw new UnauthorizedException('Invalid or expired reset link');
    const { error } = await client.auth.updateUser({ password: body.password });
    if (error) throw new UnauthorizedException('Unable to reset password');
    return { message: 'Password updated successfully' };
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshDto) {
    const { data, error } = await this.supabase.getClient().auth.refreshSession({
      refresh_token: body.refreshToken,
    });
    if (error || !data.session) throw new UnauthorizedException('Invalid or expired refresh token');
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at,
      user: data.user,
    };
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  getCurrentUser(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
