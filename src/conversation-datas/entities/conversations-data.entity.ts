import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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
  isNoteShared: boolean;

  @Column()
  isDrawBoardShared: boolean;

  @Column()
  isChattingShared: boolean;

  @Column()
  shareUuid: boolean;

  @OneToOne(
    (type) => Conversation,
    (conversation) => conversation.conversationDatas,
  )
  conversation: Conversation;
}
