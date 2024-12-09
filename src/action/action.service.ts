import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
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
        ACL: 'public-read-write',
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

  async getPresignedUrl(user_id: string, fileName: string) {
    const params = {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `${user_id}/${fileName}`,
    };

    const getPresignedUrlCommand = new GetObjectCommand(params);
    const seconds = 60 * 30;
    const presignedUrl = await getSignedUrl(
      this.s3Client as any,
      getPresignedUrlCommand,
      {
        expiresIn: seconds,
      },
    );
    return presignedUrl;
  }

  async moveToTrashFolder(user_id: string, fileName: string) {
    const copyCommand = new CopyObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `trash/${user_id}/${fileName}`,
      CopySource: `${this.configService.get('AWS_BUCKET_NAME')}/${user_id}/${fileName}`,
    });

    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `${user_id}/${fileName}`,
    });

    try {
      const copyResponse = await this.s3Client.send(copyCommand);
      // Log success message

      const deleteResponse = await this.s3Client.send(deleteCommand);
      // Log success message

      return { message: 'File moved to trash successfully' }; // Optionally return a message
    } catch (error) {
      // Log the error for debugging
      console.error('Error moving file to trash:', error);
      throw new BadRequestException(
        'Error when moving file to trash: ' + error.message,
      );
    }
  }

  async getTrash(user_id: string) {
    const getTrashCommand = await this.s3Client.send(
      new ListObjectsCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Prefix: `trash/${user_id}/`,
      }),
    );

    if (!getTrashCommand.Contents) {
      return {
        totalFiles: 0,
        files: [],
      };
    }

    const filesWithUrls = getTrashCommand.Contents.map((file) => {
      const url = `https://${this.configService.get('AWS_BUCKET_NAME')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${file.Key}`;
      return {
        ...file,
        url,
      };
    });

    return {
      totalFiles: filesWithUrls.length,
      files: filesWithUrls,
    };
  }

  async restoreFileFromTrash(user_id: string, fileName: string) {
    const copyCommand = new CopyObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `${user_id}/${fileName}`,
      CopySource: `${this.configService.get('AWS_BUCKET_NAME')}/trash/${user_id}/${fileName}`,
    });

    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `trash/${user_id}/${fileName}`,
    });

    try {
      const copyResponse = await this.s3Client.send(copyCommand);
      // Log success message

      const deleteResponse = await this.s3Client.send(deleteCommand);
      // Log success message

      return { message: 'File restored successfully' }; // Optionally return a message
    } catch (error) {
      // Log the error for debugging
      console.error('Error restoring file:', error);
      throw new BadRequestException(
        'Error when restoring file: ' + error.message,
      );
    }
  }

  async delete(user_id: string, fileName: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `trash/${user_id}/${fileName}`,
    });

    try {
      const deleteResponse = await this.s3Client.send(deleteCommand);
      // Log success message
      return { message: 'File deleted successfully' }; // Optionally return a message
    } catch (error) {
      // Log the error for debugging
      console.error('Error deleting file:', error);
      throw new BadRequestException(
        'Error when deleting file: ' + error.message,
      );
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
      return {
        totalFiles: 0,
        page,
        limit,
        files: [],
      };
    }

    // Tính toán chỉ số bắt đầu và kết thúc cho trang
    const startIndex = (page - 1) * limit;
    const endIndex = parseInt(String(startIndex)) + parseInt(String(limit));

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
