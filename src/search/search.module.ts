import { Module } from '@nestjs/common';
import { SearchService } from 'src/search/search.service';
import { SearchController } from 'src/search/search.controller';
import { KeyTokenModule } from 'src/key-token/key-token.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [SearchController],
  imports: [KeyTokenModule],
  providers: [SearchService, JwtService],
})
export class SearchModule {}
