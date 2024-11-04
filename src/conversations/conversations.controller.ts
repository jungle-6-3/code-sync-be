import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { RoomSaveDto } from './dto/room-save.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly userService: UsersService,
  ) {}

  @Post('test')
  async testConversationSave(@Body() saveDataDto: RoomSaveDto) {
    return this.conversationsService.createConversation(saveDataDto);
  }
  
  @ApiOperation({
    summary: '회의록 요청',
    description: '내가 참여한 회의록을 요청한다..',
  })
  @ApiResponse({
    status: 200,
    description: '회의록 요청 성공',
    type: ConversationResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() req: Request & { user: JwtPayloadDto },
    @Query('page') page: string,
  ) {
    const { email, name }: JwtPayloadDto = req.user;
    const user = await this.userService.findOne(email);
    const curPage = parseInt(page) || 1;
    const limit = 8; // 추후 query 요청으로 오면 변경

    const conversations = await this.conversationsService.findAll(
      user.pk,
      curPage,
      limit,
    );
    return { success: true, data: conversations };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '회의록 데이터 요청',
    description: '회의록에 대한 회의 내용을 요청한다.',
  })
  @Get(':dataPk')
  getConversationDatas(
    @Request() req: Request & { user: JwtPayloadDto },
    @Param('dataPk') dataPk: number,
  ) {
    return this.conversationsService.getConversationDatas(req.user, dataPk);
  }
  @ApiOperation({
    summary: '회의록 데이터 요청',
    description: '회의록에 대한 회의 내용을 요청한다.',
  })
  @Patch(':dataPk')
  update(
    @Param('dataPk') dataPk: number,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(dataPk, updateConversationDto);
  }

  @Delete(':dataPk')
  remove(@Param('dataPk') dataPk: number) {
    return this.conversationsService.remove(dataPk);
  }
}
