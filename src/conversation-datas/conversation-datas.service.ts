import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ConversationDatas } from './entities/conversations-data.entity';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ConversationDataSaveDto } from './dto/conversation-data-save.dto';
import { FileConfig } from './data/fileconfig';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from './file-upload.service';

@Injectable()
export class ConversationDatasService {
  private s3Client: S3Client;

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
      throw new Error('dberror');
    }
  }

  async uploadFile(fileDto: FileInfoDto) {
    const { fileName, file, extension, uuid } = fileDto;
    try {
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `${uuid}/${fileName}`,
        Body: file,
        ContentType: extension,
      });

      await this.s3Client.send(command);

      return {
        key: command.input.Key,
        url: `https://${this.configService.get('AWS_BUCKET_NAME')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${command.input.Key}`,
      };
    } catch (error) {
      throw new Error('파일 업로드 실패');
    }
  }

  async createConversationDatas(saveData: SaveDatasDto) {
    try {
      const conversationDatas =
        await this.conversationDatasRepository.create(saveData);
      await this.conversationDatasRepository.save(conversationDatas);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getConversationDatas(pk: number) {
    try {
      const conversationDatas = this.conversationDatasRepository.findOneBy({
        pk,
      });
      return conversationDatas;
    } catch (error) {
      return false;
    }
  }
}
