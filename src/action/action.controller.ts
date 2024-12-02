import {
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ActionService } from './action.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt.guard';
import { statusCodes } from 'src/types/statusCodes';
import { reasonPhrases } from 'src/types/reasonPhrases';

@ApiBearerAuth()
@ApiTags('action')
@Controller('action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post('upload')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: statusCodes.CREATED,
    description: reasonPhrases.CREATED,
    example: {
      message: 'File uploaded successfully',
      result: {
        $metadata: {
          httpStatusCode: 200,
          requestId: 'dc2ef8bc-dfc8-424e-8306-57e493eba098',
          extendedRequestId:
            's9lzHYrFp76ZVxRcpX9+5cjAnEH2ROuNkd2BHfIa6UkFVdtjf5mKR3/eTPFvsiP/XV/VLi31234=',
          attempts: 1,
          totalRetryDelay: 0,
        },
        ETag: '"c8c8fa420db82c46342f06acb620b5d4"',
        ServerSideEncryption: 'AES256',
      },
    },
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: reasonPhrases.BAD_REQUEST,
    example: {
      message: 'Error when uploading file',
    },
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: reasonPhrases.UNAUTHORIZED,
    example: {
      message: 'Unauthorized',
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1000 }),
          // new FileTypeValidator({ fileType: 'image/jpeg' }),.
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(req.user);
    const user_id = req.user?.['id'];
    console.log(
      '\x1b[33mReaching upload controller\x1b[0m\n=========================================',
    );
    console.log('user_id:', user_id);
    console.log('file name: ', file.originalname);
    console.log('file size: ', file.size);
    await this.actionService.upload(user_id, file.originalname, file.buffer);
    const result = await this.actionService.upload(
      user_id,
      file.originalname,
      file.buffer,
    );
    return { message: 'File uploaded successfully', result };
  }

  @Get('download-presigned/:fileName')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Download a file with presigned link' })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Presigned URL successfully generated.',
    example: {
      message: 'File uploaded successfully',
      presignedUrl:
        'http://test-bucket.s3.localhost.localstack.cloud:4566/1/qinshhihuang.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=test%2F20241126%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241126T153236Z&X-Amz-Expires=1800&X-Amz-Signature=deeb0a131fa7921a2a5133187723e18c24bb61093639ea045347d3ca777b4f39&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: 'Bad Request.',
    example: {
      message: 'Bad Request',
    },
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: reasonPhrases.UNAUTHORIZED,
    example: {
      message: 'Unauthorized',
    },
  })
  async downloadFileWithPresignedUrl(
    @Req() req,
    @Param('fileName') fileName: string,
  ) {
    const user_id = req.user['id'];
    console.log(
      '\x1b[33mReaching download-presigned controller\x1b[0m\n=========================================',
    );
    const presignedUrl = await this.actionService.getPresignedUrl(
      user_id,
      fileName,
    );
    return presignedUrl;
  }

  @Get('list-me')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get list file of current user' })
  @ApiResponse({
    status: 200,
    description: 'List of files',
    schema: {
      example: {
        totalFiles: 23,
        page: '1',
        limit: '15',
        files: [
          {
            Key: '1/0044.jpg',
            LastModified: '2024-10-16T01:59:53.000Z',
            ETag: '"54fdb249148a24280933dccfa7aa2a3d"',
            Size: 18522,
            StorageClass: 'STANDARD',
            Owner: {
              DisplayName: 'fcmunchen1901',
              ID: '65a0e351fd469f98f44594b58af69e4926f96cf83ad27df166074ef1e21df321',
            },
            url: 'https://nestjs-uploader-indicloud.s3.ap-southeast-1.amazonaws.com/1/0044.jpg',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: reasonPhrases.UNAUTHORIZED,
    example: {
      message: 'Unauthorized',
    },
  })
  async listFiles(
    @Req() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const user_id = req.user['id'];
    console.log(
      '\x1b[33mReaching list controller\x1b[0m\n=========================================',
    );
    return this.actionService.getFileFromUser(user_id, page, limit);
  }

  @Delete('delete/:fileName')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Delete user file' })
  @ApiResponse({
    status: 200,
    description: 'File delete successfully.',
    example: { message: 'File deleted successfully' },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: reasonPhrases.UNAUTHORIZED,
    example: {
      message: 'Unauthorized',
    },
  })
  async deleteFile(@Req() req, @Param('fileName') fileName: string) {
    const user_id = req.user['id'];
    console.log(
      '\x1b[33mReaching delete controller\x1b[0m\n=========================================',
    );
    return await this.actionService.delete(user_id, fileName);
  }
}
