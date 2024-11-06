import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationDto } from './dto/conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { createQueryBuilder, Repository } from 'typeorm';
import { ConversationDatasService } from 'src/conversation-datas/conversation-datas.service';
import { UsersService } from 'src/users/users.service';
import { RoomSaveDto } from './dto/room-save.dto';
import { GlobalHttpException } from 'src/utils/global-http-exception';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    private conversationDatasService: ConversationDatasService,
    private usersServie: UsersService,
  ) {}
  async createConversation(roomSaveDto: RoomSaveDto) {
    // TODO : Exception 처리 하기
    const { creatorPk, participantPk, title, startedAt, finishedAt } =
      roomSaveDto;
    const conversationData =
      await this.conversationDatasService.createConversationDatas(
        roomSaveDto.data,
      );
    const conversation = this.conversationRepository.create({
      creatorPk,
      participantPk,
      title,
      startedAt,
      finishedAt,
      dataPk: conversationData.pk,
    });
    return await this.conversationRepository.save(conversation);
  }

  async findAll(userPk: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .where('conversation.creatorPk =:userPk', { userPk })
      .leftJoinAndSelect('conversation.participant', 'participant')
      .leftJoinAndSelect('conversation.conversationDatas', 'conversationDatas')
      .select([
        'conversation',
        'creator.email',
        'creator.name',
        'participant.name',
        'participant.email',
        'conversationDatas.uuid',
        'conversationDatas.canShared',
      ])
      .orderBy('conversation.startedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return { total: total, conversations };
  }

  async findConversationWithDataKey(email, dataPk: number) {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.conversationDatas', 'conversationDatas')
      .where('conversation.dataPk =:dataPk', { dataPk })
      .leftJoinAndSelect('conversation.creator', 'creator')
      .select(['conversation', 'creator.pk', 'conversationDatas.uuid'])
      .getOne();

    return conversations;
  }

  async getConversationDatas(user, dataPk: number) {
    const conversation = await this.conversationRepository.findOneBy({
      dataPk,
    });
    if (!conversation) {
      throw new GlobalHttpException(
        '회의록이 존재하지 않습니다.',
        'CONVERSATION_01',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userPk = (await this.usersServie.findOne(user.email)).pk;

    if (conversation.creatorPk != userPk) {
      throw new GlobalHttpException(
        '회의록이 존재하지 않습니다.',
        'CONVERSATION_03',
        HttpStatus.BAD_REQUEST,
      );
    }

    const conversationDatas =
      this.conversationDatasService.getConversationDatas(dataPk);
    if (!conversationDatas) {
      throw new GlobalHttpException(
        '회의록이 존재하지 않습니다.',
        'CONVERSATION_02',
        HttpStatus.BAD_REQUEST,
      );
    }

    return conversationDatas;
  }

  async saveVoiceData(dataPk: number, user) {
    console.log(dataPk, user.email);
    const conversationData = await this.findConversationWithDataKey(
      user.email,
      dataPk,
    );
    console.log(conversationData);
    if (!conversationData) {
      throw new GlobalHttpException(
        '회의록이 존재하지 않습니다.',
        'CONVERSATION_04',
        HttpStatus.BAD_REQUEST,
      );
    }
    const voicePresignedUrl = this.conversationDatasService.saveVoice(
      conversationData.conversationDatas.uuid,
    );
    return voicePresignedUrl;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
