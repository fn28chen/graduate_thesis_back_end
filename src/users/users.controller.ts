import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
  Req,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { statusCodes } from 'src/types/statusCodes';
import { reasonPhrases } from 'src/types/reasonPhrases';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('user')
@Roles(Role.USER)
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/me')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get profile of current user' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    schema: {
      example: {
        id: 1,
        username: 'Phong',
        email: 'phong123@gmail.com',
        avatarUrl: null,
        createdAt: '2024-10-02T16:15:24.655Z',
        password:
          '$argon2id$v=19$m=65536,t=3,p=4$cyX9OjHRDtMaVx1pqUS2QA$N+sZNFl3J53eFejfpMfukWsgeUAPAhVgyiH1WRqymLY',
        role: 'USER',
        hashedRefreshToken: null,
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
  async getMe(@Req() req): Promise<User> {
    return this.userService.getMe(req.user.id);
  }

  @Get()
  @UseGuards(JwtGuard)
  async getAllUsers(): Promise<User[]> {
    const users = await this.userService.getAllUsers();
    return users;
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getUserById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(Number(id));
    return user;
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/me/avatar')
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
  async uploadAvatar(
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
  ): Promise<PutObjectCommandOutput> {
    const user_id = req.user?.['id'];
    console.log('user_id:', user_id);
    console.log('file name: ', file.originalname);
    console.log('file size: ', file.size);
    return this.userService.uploadAvatar(
      user_id,
      file.buffer,
      file.originalname,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard)
  async deleteById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.deleteById(Number(id));
    return user;
  }
}
