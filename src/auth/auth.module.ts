import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/entities/user.entity';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { AccessTokenStrategy } from 'src/auth/strategy/accessToken.strategy';
import { RefreshTokenStrategy } from 'src/auth/strategy/refreshToken.strategy';
import { UsersModule } from 'src/users/users.module';
import { KeyTokenModule } from 'src/key-token/key-token.module';
import { UsersService } from 'src/users/users.service';
import jwtConfig from './config/jwt.config';
import refreshJwtConfig from './config/refresh-jwt.config';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    UsersModule,
    KeyTokenModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    JwtStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
