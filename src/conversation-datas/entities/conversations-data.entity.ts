import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ConversationDatas')
export class ConversationDatas {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column()
  uuid: string;

  @Column()
  noteUrl: string;

  @Column()
  drawBoardUrl: string;

  @Column()
  chattingUrl: string;

  @Column()
  voiceUrl: string;

  @Column()
  isNoteShared: boolean;

  @Column()
  isDrawBoardShared: boolean;

  @Column()
  isChattingShared: boolean;

  @Column()
  isVoiceShared: boolean;

  @OneToOne(
    (type) => Conversation,
    (conversation) => conversation.conversationDatas,
  )
  conversation: Conversation;
}
