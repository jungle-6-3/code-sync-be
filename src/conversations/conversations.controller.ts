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
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConversationResponseDto } from './dto/conversation-response.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly userService: UsersService,
  ) {}

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
  async findAll(@Request() req: Request & { user: JwtPayloadDto }) {
    const { email, name }: JwtPayloadDto = req.user;
    const user = await this.userService.findOne(email);
    console.log('this is find conversations');

    return {
      data: {
        conversations: await this.conversationsService.findAll(user.pk),
      },
    };
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(+id);
  }
}
