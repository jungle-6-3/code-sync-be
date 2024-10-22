import { Controller, Post, UseGuards, Request, Param } from '@nestjs/common';
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
    const userPk = await this.usersService.findUserPk(req.user);
    const redirectUrl = await this.roomsService.createRoom(userPk, prUrl);
    return {
      success: true,
      message: '회의를 생성했습니다.',
      data: { redirectUrl },
    };
  }

  @Post()
  saveRoom() {}
}
