import { ApiProperty } from '@nestjs/swagger';
import { ConversationDto } from './conversation.dto';

export class ConversationResponseDto {
  @ApiProperty({
    example: 'conversations:[{...conversation}]',
    description: '회의 정보들',
  })
  conversations: ConversationDto[];
}
