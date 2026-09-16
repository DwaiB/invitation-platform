import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ConfirmEmailDto {
  @IsString()
  @MinLength(20)
  tokenHash!: string;
}

export class ResetPasswordDto extends ConfirmEmailDto {
  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
