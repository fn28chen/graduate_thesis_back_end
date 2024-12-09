import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtGuard } from 'src/guards/jwt.guard';
import { FileMetadata } from 'src/types/index';
import { statusCodes } from 'src/types/statusCodes';
import { reasonPhrases } from 'src/types/reasonPhrases';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiBearerAuth()
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/name')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: statusCodes.OK,
    description: reasonPhrases.OK,
    example: [
      {
        Key: '1/qinshhihuang.jpg',
        LastModified: '2024-11-26T15:23:37.000Z',
        ETag: '"c8c8fa420db82c46342f06acb620b5d4"',
        Size: 977973,
        StorageClass: 'STANDARD',
        Owner: {
          DisplayName: 'webfile',
          ID: '75aa57f09aa0c8caeab4f8c24e99d10f8e7faeebf76c078efc7c6caea54ba06a',
        },
      },
    ],
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: reasonPhrases.UNAUTHORIZED,
    example: {
      message: 'Unauthorized',
    },
  })
  async searchFilesByName(
        @Req() req,
    @Query('query') query: string,
  ): Promise<FileMetadata[]> {
    const user_id = req.user['id'];
    return this.searchService.searchFilesByName(user_id, query);
  }

  @Get('/extension')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: statusCodes.OK,
    description: reasonPhrases.OK,
    example: [
      {
        Key: '1/qinshhihuang.jpg',
        LastModified: '2024-11-26T15:23:37.000Z',
        ETag: '"c8c8fa420db82c46342f06acb620b5d4"',
        Size: 977973,
        StorageClass: 'STANDARD',
        Owner: {
          DisplayName: 'webfile',
          ID: '75aa57f09aa0c8caeab4f8c24e99d10f8e7faeebf76c078efc7c6caea54ba06a',
        },
      },
    ],
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: reasonPhrases.UNAUTHORIZED,
    example: {
      message: 'Unauthorized',
    },
  })
  async searchFilesByExtension(
    @Req() req,
    @Query('query') query: string,
  ): Promise<FileMetadata[]> {
    const user_id = req.user['id'];
    return this.searchService.searchFilesByExtension(user_id, query);
  }
}
