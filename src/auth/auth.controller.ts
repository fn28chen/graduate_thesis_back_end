import { Body, Controller, Get, Post, Req } from '@nestjs/common';

import { AuthService } from './auth.service';

import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshToken: { refreshToken: string }) {
    return this.authService.refreshTokens(refreshToken.refreshToken);
  }

  @Post('logout')
  async logout(@Req() req: any) {
    const userId = req.user.id;
    return this.authService.logout(userId);
  }
}
