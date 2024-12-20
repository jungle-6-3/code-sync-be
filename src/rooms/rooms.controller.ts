import { Controller, Post, UseGuards, Request, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { UsersService } from 'src/users/users.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Room API')
@UseGuards(JwtAuthGuard)
@Controller('room')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({
    summary: '방 생성',
    description: 'PR URL을 통해 방을 생성한다.',
  })
  @ApiParam({
    name: 'prUrl',
    format: 'github pr 링크',
  })
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
}
