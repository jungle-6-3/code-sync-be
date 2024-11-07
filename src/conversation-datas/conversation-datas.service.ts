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
import { S3Service } from './s3.service';
import { GlobalHttpException } from 'src/utils/global-http-exception';
import { UpdateConversationDataDto } from './dto/update-conversation-data.dto';

@Injectable()
export class ConversationDatasService {
  logger: Logger = new Logger('ConversationDataService');

  constructor(
    private configService: ConfigService,
    @InjectRepository(ConversationDatas)
    private conversationDatasRepository: Repository<ConversationDatas>,
    private s3Service: S3Service,
  ) {}

  async findOneConversationDatas(pk) {
    const conversationDatas = await this.conversationDatasRepository.findOneBy({
      pk,
    });
    return conversationDatas;
  }

  async createConversationDatas(
    conversationDataSaveDto: ConversationDataSaveDto,
  ) {
    const uuid = uuidv4();
    const uploadKeys = await this.uploadData(conversationDataSaveDto, uuid);
    try {
      const saveDatas = this.conversationDatasRepository.create({
        uuid,
        noteKey: uploadKeys.note,
        drawBoardKey: uploadKeys.drawBoard,
        chattingKey: uploadKeys.chat,
        voiceKey: uploadKeys.voice,
        codeEditorKey: uploadKeys.codeEditor,
        isNoteShared: conversationDataSaveDto.note.isShared,
        isDrawBoardShared: conversationDataSaveDto.drawBoard.isShared,
        isChattingShared: conversationDataSaveDto.chat.isShared,
        isVoiceShared: conversationDataSaveDto.voice.isShared,
        isCodeEditorShared: conversationDataSaveDto.codeEditor.isShared,
        canShared: conversationDataSaveDto.canShared,
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
    const result: Record<string, string> = {};
    try {
      for (const type of FileConfig.fileTypes) {
        const updateData = conversationDataSaveDto[type];
        if (!updateData) continue;

        const fileName = `${uuid}/${type}`;
        const file = updateData.data;
        const fileDto = { fileName, file };
        const key = await this.s3Service.uploadFile(fileDto);
        result[type] = key;
      }
      return result;
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async getDataUrls(conversationData) {
    return {
      chat: {
        url: await this.s3Service.getPresignedUrl(conversationData.chattingKey),
        isShared: conversationData.isChattingShared,
      },
      drawBoard: {
        url: await this.s3Service.getPresignedUrl(
          conversationData.drawBoardKey,
        ),
        isShared: conversationData.isDrawBoardShared,
      },
      note: {
        url: await this.s3Service.getPresignedUrl(conversationData.noteKey),
        isShared: conversationData.isNoteShared,
      },
      voice: {
        url: await this.s3Service.getPresignedUrl(conversationData.voiceKey),
        isShared: conversationData.isNoteShared,
      },
      codeEditor: {
        url: await this.s3Service.getPresignedUrl(
          conversationData.codeEditorKey,
        ),
        isShared: conversationData.isCodeEditorShared,
      },
      canShared: conversationData.canShared,
    };
  }

  async getConversationDatas(pk: number) {
    try {
      const conversationDatas =
        await this.conversationDatasRepository.findOneBy({
          pk,
        });

      return await this.getDataUrls(conversationDatas);
    } catch (error) {
      this.logger.debug(error.stack);
      throw new GlobalHttpException(
        '백엔드에게 문의하세요.',
        'CONVERSATIONDATA_DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveVoice(uuid: string) {
    const updateConversatoinDatas =
      await this.conversationDatasRepository.findOneBy({
        uuid,
      });
    const voiceKey = `${uuid}/voice`;
    updateConversatoinDatas.isVoiceShared = false;
    updateConversatoinDatas.voiceKey = voiceKey;
    this.conversationDatasRepository.save(updateConversatoinDatas);
    return this.s3Service.getPresignedUrl(voiceKey);
  }

  // 테스트용 fileType 정의

  async updateConversatoinDatas(
    updateConversationDataDto: UpdateConversationDataDto,
    dataPk,
  ) {
    const conversationData = await this.conversationDatasRepository.findOneBy({
      pk: dataPk,
    });

    // 공유 여부 확인
    for (const type of FileConfig.fileTypes) {
      const updateData = updateConversationDataDto[type];
      if (!updateData) continue;

      if (updateData.isShared) {
        conversationData[FileConfig.SHARED_COLUMN_MAP[type]] =
          updateData.isShared;
      }
    }

    // 데이터 여부 확인
    for (const type of FileConfig.fileUpdateTypes) {
      const updateData = updateConversationDataDto[type];
      if (!updateData) continue;
      if (updateData.data) {
        const fileName = `${conversationData.uuid}/${type}`;
        const file = updateData.data;
        const fileDto = { fileName, file };

        this.s3Service.uploadFile(fileDto);
      }
    }
    if (updateConversationDataDto.canShared !== undefined) {
      conversationData.canShared = updateConversationDataDto.canShared;
    }
    await this.conversationDatasRepository.save(conversationData);
  }
}
