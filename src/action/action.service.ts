import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('actions')
@Injectable()
export class ActionService {
  constructor(private readonly configService: ConfigService) {}

  private readonly s3Client = new S3Client({
    region: this.configService.get('AWS_REGION'),
    credentials: {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  });

  async upload(
    user_id: string,
    fileName: string,
    file: Buffer,
  ): Promise<PutObjectCommandOutput> {
    const uploadResponse = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: 'nestjs-uploader-indicloud',
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
          Bucket: 'nestjs-uploader-indicloud',
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

  async getPresignedSignedUrl(user_id: string, fileName: string) {
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
        Bucket: 'nestjs-uploader-indicloud',
        Key: `${user_id}/${fileName}`,
      }),
    );

    if (!deleteResponse) {
      throw new BadRequestException('File not deleted');
    }
  }

  async getFileFromUser(user_id: string) {
    const listResponse = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: 'nestjs-uploader-indicloud',
        Key: `${user_id}/`,
      }),
    );

    if (!listResponse) {
      throw new BadRequestException('No files found');
    }
  }
}
