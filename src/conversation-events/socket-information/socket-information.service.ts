import { Injectable } from '@nestjs/common';
import { CreateSocketInformationDto } from './dto/create-socket-information.dto';
import { UpdateSocketInformationDto } from './dto/update-socket-information.dto';

@Injectable()
export class SocketInformationService {
  create(createSocketInformationDto: CreateSocketInformationDto) {
    return 'This action adds a new socketInformation';
  }

  findAll() {
    return `This action returns all socketInformation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} socketInformation`;
  }

  update(id: number, updateSocketInformationDto: UpdateSocketInformationDto) {
    return `This action updates a #${id} socketInformation`;
  }

  remove(id: number) {
    return `This action removes a #${id} socketInformation`;
  }
}
