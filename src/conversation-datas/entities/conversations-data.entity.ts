import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
