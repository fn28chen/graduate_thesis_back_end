import { Module } from '@nestjs/common';
import { SearchService } from 'src/search/search.service';
import { SearchController } from 'src/search/search.controller';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
