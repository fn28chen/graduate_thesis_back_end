import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';

import { AuthService, TokenResponse } from './auth.service';
import { ValidationPipe } from '@nestjs/common';

import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { statusCodes } from 'src/types/statusCodes';

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
  @ApiResponse({
    status: statusCodes.CREATED,
    schema: {
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzMyNjMzOTIzLCJleHAiOjE3MzI3MjAzMjN9.SKSyhPrZz0hw8szXoVBfVESmB0-emLSIe9jHW3qouEs',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzMyNjMzOTIzLCJleHAiOjE3MzI3MjAzMjN9.OHJHLt15r8uS3vQPdEikws1REU4CYwPVPIUno1OnEQc',
        user: {
          id: 1,
          username: 'Phong',
          email: 'phong123@gmail.com',
          avatarUrl: null,
          createdAt: '2024-10-02T16:15:24.655Z',
          role: 'USER',
          hashedRefreshToken: null,
        },
      },
    },
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    schema: {
      example: {
        message: 'User already exists',
      },
    },
  })
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<{ token: TokenResponse; user: User }> {
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
  @ApiResponse({
    status: statusCodes.CREATED,
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzMyNjMzOTIzLCJleHAiOjE3MzI3MjAzMjN9.SKSyhPrZz0hw8szXoVBfVESmB0-emLSIe9jHW3qouEs',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzMyNjMzOTIzLCJleHAiOjE3MzI3MjAzMjN9.OHJHLt15r8uS3vQPdEikws1REU4CYwPVPIUno1OnEQc',
      user: {
        id: 1,
        username: 'Phong',
        email: 'phong123@gmail.com',
        avatarUrl: null,
        createdAt: '2024-10-02T16:15:24.655Z',
        role: 'USER',
        hashedRefreshToken: null,
      },
    },
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    schema: {
      example: {
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    example: {
      message: 'User not found',
    },
  })
  @ApiResponse({
    status: statusCodes.NOT_ACCEPTABLE,
    example: {
      message: 'Wrong Password',
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
