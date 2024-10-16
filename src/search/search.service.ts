import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3';
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

  async searchFilesByName(query: string): Promise<FileMetadata[]> {
    const listObjects = await this.s3Client.send(
      new ListObjectsCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
      }),
    );

    // console.log("Current list: ", listObjects.Contents);
    const files = listObjects.Contents;
    // Filter files by query
    const filteredFiles = files.filter((file) => file.Key.includes(query));
    // Map files to FileMetadata
    const fileMetadata = filteredFiles.map((file) => ({
      Key: file.Key,
      LastModified: file.LastModified.toISOString(),
      ETag: file.ETag,
      Size: file.Size,
      StorageClass: file.StorageClass,
      Owner: {
        DisplayName: file.Owner.DisplayName,
        ID: file.Owner.ID,
      },
    }));
    return fileMetadata;
  }
  
}
