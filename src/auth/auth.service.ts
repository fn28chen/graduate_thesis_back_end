import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { SignUpDto } from 'src/auth/dto/signup.dto';
import { LoginDto } from 'src/auth/dto/login.dto';

import User from 'src/users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    // Step 1: Check if the user already exists
    const userExists = await this.usersRepository.findOne({
      where: { email: signUpDto.email },
    });
    if (userExists) {
      throw new UnauthorizedException('Error: User already exists!');
    }

    // Step 2: Hash the password
    const genSalt = bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(signUpDto.password, genSalt);

    const newUser = this.usersRepository.create({
      ...signUpDto,
      password: hashedPassword,
    });

    // Step 3: Save user to the database
    await this.usersRepository.save(newUser);
    const token = this.jwtService.sign({ id: newUser.id });

    const { password: _, ...userWithoutPassword } = newUser;
    return { token, user: userWithoutPassword } as {
      token: string;
      user: User;
    };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({ id: user.id });

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword } as {
      token: string;
      user: User;
    };
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
