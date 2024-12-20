import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ConversationDatas')
export class ConversationDatas {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column()
  uuid: string;

  @Column()
  noteKey: string;

  @Column()
  drawBoardKey: string;

  @Column()
  chattingKey: string;

  @Column()
  voiceKey: string;

  @Column()
  codeEditorKey: string;

  @Column()
  isNoteShared: boolean;

  @Column()
  isDrawBoardShared: boolean;

  @Column()
  isChattingShared: boolean;

  @Column()
  isVoiceShared: boolean;

  @Column()
  isCodeEditorShared: boolean;

  @Column()
  summaryKey: string;

  @Column()
  isSummaryShared: boolean;

  @Column()
  canShared: boolean;

  @OneToOne(
    (type) => Conversation,
    (conversation) => conversation.conversationDatas,
  )
  conversation: Conversation;
}
