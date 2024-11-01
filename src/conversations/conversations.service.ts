import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationDto } from './dto/conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { ConversationDatas } from 'src/conversation-datas/entities/conversations-data.entity';
import { ConversationDatasService } from 'src/conversation-datas/conversation-datas.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    private conversationDatasService: ConversationDatasService,
    private usersServie: UsersService,
  ) {}
  async createConversation(conversationDto: ConversationDto) {
    // TODO : Exception 처리 하기
    try {
      const conversation = this.conversationRepository.create(conversationDto);
      await this.conversationRepository.save(conversation);
      return true;
    } catch (error) {
      return false;
    }
  }

  async findAll(userPk: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .leftJoinAndSelect('conversation.participant', 'participant')
      .select([
        'conversation',
        'creator.email',
        'creator.name',
        'participant.name',
        'participant.email',
      ])
      .where('conversation.creatorPk =:userPk', { userPk })
      .orWhere('conversation.participantPk =:userPk', { userPk })
      .orderBy('conversation.startedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return { total: total, conversations };
  }

  async getConversationDatas(user, dataPk: number) {
    const conversation = await this.conversationRepository.findOneBy({
      dataPk,
    });
    const conversationDatas =
      this.conversationDatasService.getConversationDatas(dataPk);
    // TODO: Custom Exception으로 처리 (에러 코드와 함께 처리)
    if (!conversation || !conversationDatas) {
      throw new HttpException(
        '회의가 종료되지 않았습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userPk = (await this.usersServie.findOne(user.email)).pk;

    if (conversation.creatorPk != userPk) {
      throw new HttpException(
        '참여하지 않은 회의입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log(conversation);
    return conversationDatas;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
