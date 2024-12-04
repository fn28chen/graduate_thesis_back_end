import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
import { KeyTokenService } from 'src/key-token/key-token.service';
import { KeyTokenModule } from 'src/key-token/key-token.module';
import { BlackListToken } from 'src/entities/blackList.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, BlackListToken]), KeyTokenModule],
  controllers: [UsersController],
  providers: [UsersService, JwtService, KeyTokenService],
  exports: [UsersService],
})
export class UsersModule {}
