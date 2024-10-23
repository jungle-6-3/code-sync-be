import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { S3Service } from './s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('s3')
export class S3Controller {
  constructor(private s3Service: S3Service) {}
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('파일이 없습니다.');
      }

      const result = await this.s3Service.uploadFile(file);

      return {
        statusCode: 200,
        message: '파일 업로드 성공',
        data: {
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          ...result,
        },
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message,
      };
    }
  }
}
