import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConversationDatasService } from './conversation-datas.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Conversation-datas')
@Controller('conversation-datas')
export class ConversationDatasController {
  constructor(private conversationDatasService: ConversationDatasService) {}
  @Get()
  printHello() {
    return 'hello';
  }

  @ApiOperation({
    summary: 'File upload',
    description:
      '파일 업로드를 요청한다. (클라이언트에서 영상을 올릴 경우를 대비)',
  })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // TODO: Exception 관리 (custom filter/exception 생성)
    try {
      if (!file) {
        throw new Error('파일이 없습니다.');
      }

      const result = await this.conversationDatasService.uploadClient(file);

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
