import {
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { UsersService } from 'src/users/users.service';

@Controller('room')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create/:prUrl')
  async createRoom(
    @Param('prUrl') prUrl: string,
    @Request() req: Request & { user: JwtPayloadDto },
  ) {
    const user = await this.usersService.findUserbyPayload(req.user);
    if (!user) {
      throw new UnauthorizedException('회원을 찾을 수 없습니다.');
    }
    const redirectUrl = await this.roomsService.createRoom(user, prUrl);
    return {
      success: true,
      message: '회의를 생성했습니다.',
      data: { redirectUrl },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('save/:roomUuid')
  async saveRoom(
    @Param('roomUuid') roomUuid: string,
    @Request() req: Request & { user: JwtPayloadDto },
  ) {
    const user = await this.usersService.findUserbyPayload(req.user);
    await this.roomsService.saveRoom(user, roomUuid);
    return {
      success: true,
      message: '저장에 성공했습니다.',
    };
  }
}
