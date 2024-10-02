import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyToken } from 'src/entities/keyToken.entity';
import { KeyTokenController } from './key-token.controller';
import { KeyTokenService } from './key-token.service';
@Module({
    imports: [TypeOrmModule.forFeature([KeyToken])],
    controllers: [KeyTokenController],
    providers: [KeyTokenService],
    exports: [KeyTokenService],
})
export class KeyTokenModule {

}
