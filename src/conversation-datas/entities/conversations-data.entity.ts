import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ConversationDatas {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column()
  nodeUrl: string;

  @Column()
  drawBoardUrl: string;

  @Column()
  chattingUrl: string;

  @Column()
  isNodeShared: boolean;

  @Column()
  isDrawBoardShared: boolean;

  @Column()
  isChattingShared: boolean;

  @Column()
  uuid: string;

  @Column()
  shareUuid: string;
}
