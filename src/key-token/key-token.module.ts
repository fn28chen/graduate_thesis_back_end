import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlackListToken } from 'src/entities/blackList.entity';
import { KeyTokenService } from './key-token.service';
@Module({
    imports: [TypeOrmModule.forFeature([BlackListToken])],
    providers: [KeyTokenService],
    exports: [KeyTokenService],
})
export class KeyTokenModule {

}
