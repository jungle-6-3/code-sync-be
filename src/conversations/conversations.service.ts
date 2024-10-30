import { Injectable } from '@nestjs/common';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationDto } from './dto/conversation.dto';

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

  async findAll(userPk: number) {
    const conversations = await this.conversationRepository
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
      .getMany();
    return conversations;
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
