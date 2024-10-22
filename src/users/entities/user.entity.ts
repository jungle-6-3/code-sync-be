import {
  Column,
  CreateDateColumn,
  Entity,
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
}
