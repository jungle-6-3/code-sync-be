import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    try {
      const user = await this.usersRepository.create({
        name,
        email,
        hashedPassword: password,
      });
      await this.usersRepository.save(user);
      return true;
    } catch (error) {
      return false;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(email: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ email });
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findUserbyPayload({ email, name }: JwtPayloadDto) {
    const user = await this.findOne(email);
    if (!user || user.name !== name) {
      throw new UnauthorizedException('회원을 찾을 수 없습니다.');
    }
    return user;
  }
}
