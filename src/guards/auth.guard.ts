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

    const isBlacklisted = await this.checkBlacklist(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    const validToken = await this.checkValidToken(request, token);
    if (!validToken) {
      throw new UnauthorizedException('Token is invalid');
    }
    return true;
  }

  private async extractTokenFromHeader(
    request: Request,
  ): Promise<string | undefined> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async checkBlacklist(token: string) {
    const isBlacklisted = await this.keyTokenService.isBlacklisted(token);
    return isBlacklisted;
  }

  private async checkValidToken(request: Request, token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['token'] = payload;
      return true;
    } catch {
      return false;
    }
  }
}
