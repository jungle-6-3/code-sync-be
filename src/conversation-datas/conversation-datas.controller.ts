import { Controller, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Conversation-datas')
@Controller('conversation-datas')
@UseGuards(JwtAuthGuard)
export class ConversationDatasController {}
