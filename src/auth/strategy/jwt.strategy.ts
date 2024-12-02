import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload): Promise<User> {
    const { id } = payload;
    const user = await this.usersRepository.findOneBy(id);
    // console.log('This is the payload:\n --------------------------------------------------------');
    // console.log('user', user);
    if (!user) {
      throw new UnauthorizedException('Login first to access this endpoint.');
    }
    return user;
  }
}
