import { ConversationDatas } from 'src/conversation-datas/entities/conversations-data.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Conversation')
export class Conversation {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column()
  creatorPk: number;

  @Column()
  participantPk: number;

  @Column()
  dataPk: number;

  @Column()
  title: string;

  @Column()
  startedAt: Date;

  @Column()
  finishedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(
    (Type) => ConversationDatas,
    (conversationDatas) => conversationDatas.conversation,
    { cascade: true },
  )
  @JoinColumn({ name: 'dataPk' })
  conversationDatas: ConversationDatas;

  @ManyToOne((type) => User, (user) => user.createConversations)
  creator: User;

  @ManyToOne((type) => User, (user) => user.particimentConversations)
  participant: User;
}
