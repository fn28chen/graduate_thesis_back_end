import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtGuard } from 'src/guards/jwt.guard';
import { FileMetadata } from 'src/types/index';

@ApiBearerAuth()
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(JwtGuard)
  async searchFiles(@Query('query') query: string): Promise<FileMetadata[]> {
    return this.searchService.searchFilesByName(query);
  }
}
