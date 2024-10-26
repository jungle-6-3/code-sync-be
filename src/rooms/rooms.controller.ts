import { Controller, Post, UseGuards, Request, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { UsersService } from 'src/users/users.service';

@UseGuards(JwtAuthGuard)
@Controller('room')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('create/:prUrl')
  async createRoom(
    @Param('prUrl') prUrl: string,
    @Request() req: Request & { user: JwtPayloadDto },
  ) {
    const user = await this.usersService.findUserbyPayload(req.user);
    const roomUuid = await this.roomsService.createRoom(user, prUrl);
    return {
      success: true,
      message: '회의를 생성했습니다.',
      data: { roomUuid },
    };
  }

  @Post('save/:roomUuid')
  async saveRoom(
    @Param('roomUuid') roomUuid: string,
    @Request() req: Request & { user: JwtPayloadDto },
  ) {
    const user = await this.usersService.findUserbyPayload(req.user);
    const room = await this.roomsService.findRoombyUuid(roomUuid);
    await this.roomsService.saveRoom(room, user);
    return {
      success: true,
      message: '저장에 성공했습니다.',
    };
  }
}
