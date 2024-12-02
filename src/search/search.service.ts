import { BadRequestException, Injectable } from '@nestjs/common';
import { ListObjectsCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { createS3Client } from 'src/config/aws-s3.config';
import { FileMetadata } from 'src/types/index';

@ApiTags('search')
@Injectable()
export class SearchService {
  private readonly s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = createS3Client(this.configService);
  }

  async searchFilesByName(user_id: string, query: string): Promise<FileMetadata[]> {
    if (query.length < 3) {
      throw new BadRequestException('Error: Query too short');
    }

    const listObjects = await this.s3Client.send(
      new ListObjectsCommand({
        Prefix: `${user_id}/`,
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
      }),
    );

    const files = listObjects.Contents;
    const lowerCaseQuery = query.toLowerCase();
    const filteredFiles = files.filter((file) =>
      file.Key.toLowerCase().includes(lowerCaseQuery),
    );

    return filteredFiles.map((file) => ({
      Key: file.Key,
      LastModified: file.LastModified.toISOString(),
      ETag: file.ETag,
      Size: file.Size,
      StorageClass: file.StorageClass,
      Owner: {
        DisplayName: file.Owner.DisplayName,
        ID: file.Owner.ID,
      },
      url: `https://${this.configService.get('AWS_BUCKET_NAME')}.s3.amazonaws.com/${file.Key}`,
    }));
  }

  async searchFilesByExtension(user_id: string, query: string): Promise<FileMetadata[]> {
    if (query.length < 3) {
      throw new BadRequestException('Error: Query too short');
    }

    const listObjects = await this.s3Client.send(
      new ListObjectsCommand({
        Prefix: `${user_id}/`,
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
      }),
    );

    const files = listObjects.Contents;
    const filteredFiles = files.filter((file) => file.Key.endsWith(query));

    return filteredFiles.map((file) => ({
      Key: file.Key,
      LastModified: file.LastModified.toISOString(),
      ETag: file.ETag,
      Size: file.Size,
      StorageClass: file.StorageClass,
      Owner: {
        DisplayName: file.Owner.DisplayName,
        ID: file.Owner.ID,
      },
      url: `https://${this.configService.get('AWS_BUCKET_NAME')}.s3.amazonaws.com/${file.Key}`,
    }));
  }
}
