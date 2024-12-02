import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { createS3Client } from 'src/config/aws-s3.config';

@Injectable()
export class UsersService {
  private readonly s3Client: S3Client;
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.s3Client = createS3Client(this.configService);
  }


  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return await this.usersRepository.update(
      { id: userId },
      { hashedRefreshToken },
    );
  }

  async getAllUsers() {
    const users = this.usersRepository.find();
    return users;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      return user;
    }
    throw new NotFoundException('Could not find the user');
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async getMe(userId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (user) {
      return user;
    }
    throw new NotFoundException('Could not find the user');
  }

  async uploadAvatar(userId: number, file: Buffer, fileName: string) {
    const uploadResponse = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `Avatar/${userId}/${fileName}`,
        Body: file,
        ACL: 'bucket-owner-full-control',
      }),
    );
    if (!uploadResponse) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error when uploading file',
      });
    }
    return uploadResponse;
  }

  async updateById(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      return null;
    }

    await this.usersRepository.update({ id: id }, updateUserDto);
    return await this.usersRepository.findOne({ where: { id: id } });
  }

  async deleteById(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      return null;
    }

    await this.usersRepository.remove(user);
    return user;
  }
}
