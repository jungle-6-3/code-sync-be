import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { GlobalHttpException } from 'src/utils/global-http-exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    if ((await this.usersRepository.findOneBy({ email })) !== undefined) {
      return false;
    }
    const user = await this.usersRepository.create({
      name,
      email,
      hashedPassword: password,
    });
    try {
      await this.usersRepository.save(user);
      return true;
    } catch (error) {
      throw new GlobalHttpException('DB에러입니다. 백엔드에게 문의해주세요.','USER_01',HttpStatus.UNAUTHORIZED);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(email: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ email });
    return user;
  }

  async fineOneByPk(pk: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ pk });
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
