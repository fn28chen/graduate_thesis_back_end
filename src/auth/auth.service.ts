import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';

import { UsersService } from 'src/users/users.service';

import { SignUpDto } from 'src/auth/dto/signup.dto';
import { LoginDto } from 'src/auth/dto/login.dto';

import { User } from 'src/entities/user.entity';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
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
    console.log('Hashing data: ', typeof argon2.hash(data));
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

  async login(loginDto: LoginDto): Promise<{ token: string }> {
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

    console.log(isPasswordMatched);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Step 3: Create a token pair
    const tokens = await this.createTokenPair({ id: user.id });
    const { password: _, ...userWithoutPassword } = user;
    console.log('Token: ', tokens);
    return { token: tokens.accessToken, user: userWithoutPassword } as {
      token: string;
      user: User;
    };
  }

  async logout(id: number) {
    // Step 1: Revoke the refresh token

    // Step 2: Logout user
    await this.usersService.updateById(id, { refreshToken: null });
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
