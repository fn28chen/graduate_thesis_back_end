import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  GetObjectAclCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
@Injectable()
export class ActionService {
  constructor(private readonly configService: ConfigService) {}

  private readonly s3Client = new S3Client({
    region: this.configService.get('AWS_REGION'),
    credentials: {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  });

  async upload(user_id: string, fileName: string, file: Buffer): Promise<void> {
    const uploadResponse = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `${user_id}/${fileName}`,
        Body: file,
        ACL: 'bucket-owner-full-control',
      }),
    );
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
      const asStream = downloadResponse.Body as Readable;
      return asStream;
    } catch (error) {
      throw new Error('File not found');
    }
  }

  async delete(user_id: string, fileName: string) {
    const deleteResponse = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: 'nestjs-uploader-indicloud',
        Key: `${user_id}/${fileName}`,
      }),
    );
  }


}
