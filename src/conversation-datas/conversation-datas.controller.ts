import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConversationDatasService } from './conversation-datas.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('conversation-datas')
export class ConversationDatasController {
  constructor(private conversationDatasService: ConversationDatasService) {}
  @Get()
  printHello() {
    return 'hello';
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('파일이 없습니다.');
      }

      const result = await this.conversationDatasService.uploadFile(file);

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