import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { json } from 'stream/consumers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 패스워드 해쉬 함수
  async hashingPasswd(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    try {
      // 비밀번호 해쉬화
      const hashedPassword = await this.hashingPasswd(password);

      const user = await this.usersRepository.create({
        name,
        email,
        hashedPassword,
      });
      await this.usersRepository.save(user);
      console.log('true');
      return true;
    } catch (error) {
      console.log('😱 error is' + error);
      return false;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(email:string) {
    const user = await this.usersRepository.findOneBy({email});
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
