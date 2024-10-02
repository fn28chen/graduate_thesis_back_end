import {
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ActionService } from './action.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import * as os from 'os';
import * as path from 'path';

@Controller('action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post('upload')
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
    const user_id = req.user['id'];
    console.log(
      '\x1b[33mReaching upload controller\x1b[0m\n=========================================',
    );
    console.log('user_id:', user_id);
    await this.actionService.upload(user_id, file.originalname, file.buffer);
  }

  @Get('download/:fileName')
  async downloadFile(
    @Req() req,
    @Param('fileName') fileName: string,
    @Res() res,
  ) {
    const user_id = req.user['id'];
    console.log(
      '\x1b[33mReaching download controller\x1b[0m\n=========================================',
    );
    console.log('user_id:', user_id);
    console.log('fileName:', fileName);

    const file = await this.actionService.download(user_id, fileName);
    const downloadPath = path.join(os.homedir(), 'Downloads', fileName);
    // const downloadPath = path.join(os.tmpdir(), fileName);

    const writeStream = createWriteStream(downloadPath);
    file.pipe(writeStream);
    writeStream.on('finish', () => {
      console.log('Download completed');
      res.download(downloadPath, fileName, (err) => {
        if (err) {
          console.log('Error:', err);
        } else {
          console.log('File sent to: ' + downloadPath);
        }
      });
    });

    // writeStream.on('finish', () => {
    //   res.setHeader('Content-Type', 'application/octet-stream');
    //   res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    //   res.setHeader('Content-Length', fs.statSync(downloadPath).size);

    //   const readStream = fs.createReadStream(downloadPath);
    //   readStream.pipe(res);
    // });
  }

  @Get('list')
  async listFiles(@Req() req) {
    const user_id = req.user['id'];
    console.log(
      '\x1b[33mReaching list controller\x1b[0m\n=========================================',
    );
    console.log('user_id:', user_id);
    return this.actionService.getFileFromUser(user_id);
  }

  @Delete('delete/:fileName')
  async deleteFile(@Req() req, @Param('fileName') fileName: string) {
    const user_id = req.user['id'];
    console.log(
      '\x1b[33mReaching delete controller\x1b[0m\n=========================================',
    );
    console.log('user_id:', user_id);
    console.log('fileName:', fileName);
    await this.actionService.delete(user_id, fileName);
  }
}
