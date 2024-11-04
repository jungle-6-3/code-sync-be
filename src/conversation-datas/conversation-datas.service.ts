import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ConversationDatas } from './entities/conversations-data.entity';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ConversationDataSaveDto } from './dto/conversation-data-save.dto';
import { FileConfig } from './data/fileconfig';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from './file-upload.service';
import { GlobalHttpException } from 'src/utils/global-http-exception';

@Injectable()
export class ConversationDatasService {
  private s3Client: S3Client;
  logger: Logger = new Logger('ConversationDataService');

  constructor(
    private configService: ConfigService,
    @InjectRepository(ConversationDatas)
    private conversationDatasRepository: Repository<ConversationDatas>,
    private uploadFileService: FileUpload,
  ) {}
  async createConversationDatas(
    conversationDataSaveDto: ConversationDataSaveDto,
  ) {
    const uuid = uuidv4();
    const uploadKeys = await this.uploadData(conversationDataSaveDto, uuid);
    try {
      const saveDatas = this.conversationDatasRepository.create({
        uuid,
        noteUrl: uploadKeys.note,
        drawBoardUrl: uploadKeys.board,
        chattingUrl: uploadKeys.chat,
        voiceUrl: uploadKeys.voice,
        isNoteShared: conversationDataSaveDto.note.isShared,
        isDrawBoardShared: conversationDataSaveDto.board.isShared,
        isChattingShared: conversationDataSaveDto.chat.isShared,
        isVoiceShared: conversationDataSaveDto.voice.isShared,
      });

      const result = await this.conversationDatasRepository.save(saveDatas);
      return result;
    } catch (error) {
      this.logger.debug(error.stack);
      throw new GlobalHttpException(
        'DB Error',
        'CONVERSATIONDATA_DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadData(conversationDataSaveDto: ConversationDataSaveDto, uuid) {
    try {
      const uploads = Object.entries(FileConfig.fileConfigs).map(
        async ([filename, contentType]) => {
          const uploadData = {
            fileName: `${uuid}/${filename}`,
            file: conversationDataSaveDto[filename].data,
            contentType: contentType.ContentType,
          };

          const url = await this.uploadFileService.uploadFile(uploadData);
          return [filename, url];
        },
      );
      return Object.fromEntries(await Promise.all(uploads));
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async getConversationDatas(pk: number) {
    try {
      const conversationDatas = this.conversationDatasRepository.findOneBy({
        pk,
      });
      return conversationDatas;
    } catch (error) {
      this.logger.debug(error.stack);
      throw new GlobalHttpException(
        'DB Error',
        'CONVERSATIONDATA_DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
