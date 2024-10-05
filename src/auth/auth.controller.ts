import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { ValidationPipe } from 'src/utils/validation/validation.pipe';

import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

@ApiTags('auth')
@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        username: 'Phong',
        email: 'phong123@gmail.com',
        password: '123456@a',
      },
    },
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        email: 'phong123@gmail.com',
        password: '123456@a',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshToken: { refreshToken: string }) {
    return this.authService.refreshTokens(refreshToken.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
    },
  })
  async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }
}
