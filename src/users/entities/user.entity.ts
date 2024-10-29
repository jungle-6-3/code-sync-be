import { Conversation } from 'src/conversations/entities/conversation.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  hashedPassword: string;

  @CreateDateColumn()
  createAt: string;

  @OneToMany((type) => Conversation, (conversation) => conversation.creator)
  createConversations: Conversation[];

  @OneToMany((type) => Conversation, (conversation) => conversation.participant)
  particimentConversations: Conversation[];
}
