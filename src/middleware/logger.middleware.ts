import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    // Step 1: Give token
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      req['token'] = token;

      try {
        const decoded = this.jwtService.verify(req['token'],
          { secret: process.env.JWT_SECRET }
        );
        req['user'] = decoded;
      } catch (error) {
        console.log('Error: ', error.message);
      }
    } else {
      console.log('No token');
    }
    next();
    console.log('Response...');
  }
}
