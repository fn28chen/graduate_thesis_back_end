import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as argon2 from 'argon2';

import { UsersService } from 'src/users/users.service';

import { SignUpDto } from 'src/auth/dto/signup.dto';
import { LoginDto } from 'src/auth/dto/login.dto';

import { User } from 'src/entities/user.entity';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyTokenService } from 'src/key-token/key-token.service';
import { LogoutDto } from './dto/logout.dto';
import { STATUS_CODES } from 'http';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private keyTokenService: KeyTokenService,
  ) {}

  async createTokenPair(payload: any): Promise<any> {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '1d',
    });

    return { accessToken, refreshToken };
  }

  hashData(data: string) {
    // console.log('Hashing data: ', typeof argon2.hash(data));
    return argon2.hash(data);
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.updateById(id, {
      refreshToken: hashedRefreshToken,
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    // Step 1: Check if the user already exists
    const userExists = await this.usersRepository.findOne({
      where: { email: signUpDto.email },
    });
    if (userExists) {
      throw new BadRequestException('Error: User already exists!');
    }

    // Step 2: Hash the password
    const hashedPassword = await this.hashData(signUpDto.password);

    // Step 3: Save user to the database, set roles to user
    const newUser = this.usersRepository.create({
      ...signUpDto,
      password: hashedPassword,
    });
    await this.usersRepository.save(newUser);

    // Step 4: Create a token pair
    const token = await this.createTokenPair({ id: newUser.id });
    const { password: _, ...userWithoutPassword } = newUser;
    console.log('Token: ', token);
    return { token, user: userWithoutPassword } as {
      token: string;
      user: User;
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    // Step 1: Check if the user exists
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Step 2: Compare the password from login and the password from the database
    const isPasswordMatched = await argon2.verify(user.password, password);
    console.log('Password match:', isPasswordMatched);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Step 3: Create a token pair and save the refresh token to the database
    const tokens = await this.createTokenPair({ id: user.id });
    const { password: _, ...userWithoutPassword } = user;
    console.log('Token: ', tokens);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword,
    } as {
      accessToken: string;
      refreshToken: string;
      user: User;
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('Invalid Refresh Token');

    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid Refresh Token');

    return { id: userId };
  }

  async logout(logoutDto: LogoutDto) {
    // Step 1: Add the access token and refresh token to the blacklist
    // Khong can doi
    const { accessToken, refreshToken } = logoutDto;

    await this.keyTokenService.addTokenToBlacklist(accessToken);
    await this.keyTokenService.addTokenToBlacklist(refreshToken);

    return { message: 'Successfully logged out' };
  }

  async refreshTokens(refreshToken: string): Promise<{ token: string }> {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const user = await this.usersRepository.findOne({
      where: { id: payload.id },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const token = this.jwtService.sign({ id: user.id });

    return { token } as { token: string };
  }
}
