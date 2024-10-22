import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ApiTags } from '@nestjs/swagger';
import { createS3Client } from 'src/config/aws-s3.config';

@ApiTags('actions')
@Injectable()
export class ActionService {
  private readonly s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = createS3Client(this.configService);
  }

  async upload(
    user_id: string,
    fileName: string,
    file: Buffer,
  ): Promise<PutObjectCommandOutput> {
    const uploadResponse = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `${user_id}/${fileName}`,
        Body: file,
        ACL: 'bucket-owner-full-control',
      }),
    );
    if (!uploadResponse) {
      throw new BadRequestException('File not uploaded');
    }
    return uploadResponse;
  }

  async download(user_id: string, fileName: string) {
    try {
      const downloadResponse = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.configService.get('AWS_BUCKET_NAME'),
          Key: `${user_id}/${fileName}`,
        }),
      );
      // console.log(typeof downloadResponse.Body);
      // return downloadResponse.Body;
      return downloadResponse.Body as Readable;
    } catch (error) {
      throw new BadRequestException('Error when downloading file:', error);
    }
  }

  async getPresignedUrl(user_id: string, fileName: string) {
    const params = {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `${user_id}/${fileName}`,
    };

    const command = new GetObjectCommand(params);
    const seconds = 60 * 30;
    const presignedUrl = await getSignedUrl(this.s3Client as any, command, {
      expiresIn: seconds,
    });
    console.log('Presigned URL is: ', presignedUrl);
    return presignedUrl;
  }

  async delete(user_id: string, fileName: string) {
    const deleteResponse = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `${user_id}/${fileName}`,
      }),
    );

    if (!deleteResponse) {
      throw new BadRequestException('File not deleted');
    }
  }

  async getFileFromUser(user_id: string, page: number, limit: number) {
    const listObjects = await this.s3Client.send(
      new ListObjectsCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Prefix: `${user_id}/`,
      }),
    );

    if (!listObjects.Contents) {
      throw new BadRequestException('No files found for the user');
    }

    // Tính toán chỉ số bắt đầu và kết thúc cho trang
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const filesWithUrls = listObjects.Contents.map((file) => {
      const url = `https://${this.configService.get('AWS_BUCKET_NAME')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${file.Key}`;
      return {
        ...file,
        url,
      };
    });

    // Cắt danh sách tệp theo trang
    const paginatedFiles = filesWithUrls.slice(startIndex, endIndex);

    return {
      totalFiles: filesWithUrls.length,
      page,
      limit,
      files: paginatedFiles,
    };
  }
}
