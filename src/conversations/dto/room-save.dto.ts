import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ConversationDataSaveDto } from 'src/conversation-datas/dto/conversation-data-save.dto';

@ApiExtraModels(ConversationDataSaveDto)
export class RoomSaveDto {
  @ApiProperty({
    example: '1',
    description: 'creator pk',
  })
  @IsNotEmpty()
  @IsNumber()
  creatorPk: number;

  @ApiProperty({
    example: '1',
    description: 'participant pk',
  })
  @IsNotEmpty()
  @IsNumber()
  participantPk: number;

  @ApiProperty({
    example: '10월 17일 로그인 구현 PR',
    description: 'Conversation Title / 회의 제목',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: '2024-04-12 14:00:00',
    description: '회의 시작 시간',
  })
  @IsNotEmpty()
  @IsDate()
  startedAt: Date;

  @ApiProperty({
    example: '2024-04-12 15:00:00',
    description: '회의 종료 시간',
  })
  @IsNotEmpty()
  @IsDate()
  finishedAt: Date;

  @IsNotEmpty()
  data: ConversationDataSaveDto;
}
