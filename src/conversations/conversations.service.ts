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
import { UpdateConversationDatasDto } from './dto/update-conversationdatas.dto';

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

  async getUpdateConversationDatas(user, dataPk: number) {
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
      this.conversationDatasService.getUpdateConversationDatas(dataPk);
    if (!conversationDatas) {
      throw new GlobalHttpException(
        '회의록이 존재하지 않습니다.',
        'CONVERSATION_02',
        HttpStatus.BAD_REQUEST,
      );
    }

    return conversationDatas;
  }

  async getConversationDatas(uuid: string) {
    const conversationDatas =
      await this.conversationDatasService.getConversationDatasToShared(uuid);
    if (!conversationDatas) {
      throw new GlobalHttpException(
        '허가되지 않은 접근입니다.',
        'CONVERSATIONDATAS_04',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return conversationDatas;
  }

  async update(
    user,
    dataPk: number,
    updateConversationDatasDto: UpdateConversationDatasDto,
  ) {
    // 유저 검증
    // title 변경 여부 확인
    // 이 외의 변경 내용 conversationDatas로 전달.
    const conversation = await this.conversationRepository.findOneBy({
      dataPk,
    });

    const userPk = (await this.usersServie.findOne(user.email)).pk;
    if (conversation.creatorPk != userPk) {
      throw new GlobalHttpException(
        '회의록이 존재하지 않습니다.',
        'CONVERSATION_03',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateConversationDatasDto.title) {
      conversation.title = updateConversationDatasDto.title;
      this.conversationRepository.save(conversation);
    }

    const result = this.conversationDatasService.updateConversatoinDatas(
      updateConversationDatasDto,
      dataPk,
    );

    return;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
