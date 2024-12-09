import { Module } from '@nestjs/common';
import { ActionController } from './action.controller';
import { ActionService } from './action.service';
import { JwtService } from '@nestjs/jwt';
import { KeyTokenModule } from 'src/key-token/key-token.module';

@Module({
  controllers: [ActionController],
  imports: [KeyTokenModule],
  providers: [ActionService, JwtService],
})
export class ActionModule {}
