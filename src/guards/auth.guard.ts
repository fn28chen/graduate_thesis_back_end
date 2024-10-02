import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { KeyTokenService } from 'src/key-token/key-token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private keyTokenService: KeyTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = await this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['token'] = payload;
    } catch {
      throw new UnauthorizedException('Token is invalid');
    }
    return true;
  }

  private async extractTokenFromHeader(
    request: Request,
  ): Promise<string | undefined> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const isBlacklisted = await this.keyTokenService.isBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is in blacklist');
    }
    return type === 'Bearer' ? token : undefined;
  }
}
