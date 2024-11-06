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
import { S3Service } from './s3.service';
import { GlobalHttpException } from 'src/utils/global-http-exception';
import { UpdateConversationDataDto } from './dto/update-conversation-data.dto';
import { FileInfoDto } from './dto/file-info.dto';
import { CodeEditor } from './data/codeEditor';

@Injectable()
export class ConversationDatasService {
  private s3Client: S3Client;
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
        // voiceKey: uploadKeys.voice,
        codeEditorKey: uploadKeys.codeEditor,
        isNoteShared: conversationDataSaveDto.note.isShared,
        isDrawBoardShared: conversationDataSaveDto.drawBoard.isShared,
        isChattingShared: conversationDataSaveDto.chat.isShared,
        // isVoiceShared: conversationDataSaveDto.voice.isShared,
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
    try {
      const uploads = Object.entries(FileConfig.fileConfigs).map(
        async ([filename, contentType]) => {
          // if(conversationDataSaveDto[filename]==undefined) return; //추후 fileType 리팩터링 후 사용
          const uploadData = {
            fileName: `${uuid}/${filename}`,
            file: conversationDataSaveDto[filename].data,
            contentType: contentType.ContentType,
          };

          const key = await this.s3Service.uploadFile(uploadData);
          return [filename, key];
        },
      );
      return Object.fromEntries(await Promise.all(uploads));
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
      // voice: {
      //   url: await this.s3Service.getPresignedUrl(conversationData.voiceKey),
      //   isShared: conversationData.isNoteShared,
      // },
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
    /**
     * 회의 기록이 수정될 경우 s3에 있던 기존 데이터를 삭제하고 새로 만들어진 데이터를 넣어야함.
     * 다른 방법도 있지만 일단 이 방법으로 하고 이후 수정
     *
     * key는 기존의 key를 그대로 사용.
     **
     * 공유여부가 수정되었을 경우 db에 업데이트
     **
     * canShared 마지막에 확인 필요
     */
    const updates = {};
    const conversationData = await this.conversationDatasRepository.findOneBy({
      pk: dataPk,
    });

    for (const type of fileTypes) {
      const updateData = updateConversationDataDto[type];
      if (!updateData) continue;
      if (updateData.data) {
        // s3에 데이터 삭제하고 다시 넣는 로직 작성
        const contentType = FileConfig.fileConfigs[type].ContentType;
        const fileName = `${conversationData.uuid}/${type}`;
        const file = updateData.data;
        const fileDto = { contentType, fileName, file };

        this.s3Service.uploadFile(fileDto);
      }
      if (updateData.isShared) {
        conversationData[SHARED_COLUMN_MAP[type]] = updateData.isShared;
      }
    }
    if (updateConversationDataDto.canShared !== undefined) {
      conversationData.canShared = updateConversationDataDto.canShared;
    }
    await this.conversationDatasRepository.save(conversationData);
  }
}
export const fileTypes = [
  'chat',
  'drawBoard',
  'voice',
  'note',
  'codeEditor',
] as const;
export const SHARED_COLUMN_MAP = {
  chat: 'isChattingShared',
  drawBoard: 'isDrawBoardShared',
  voice: 'isVoiceShared',
  note: 'isNoteShared',
  codeEditor: 'isCodeEditorShared',
} as const;
