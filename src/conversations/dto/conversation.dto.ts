import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

class UserDto {
  @ApiProperty({
    example: '지창근',
    description: 'creators email/회의 참석자 이름',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'pig19980@github.com',
    description: 'creators email/회의 참석자 이름',
  })
  @IsEmail()
  email: string;
}

// TODO: 하나만 조회하거나 하나의 conversation에 대해서 확인하는 로직없다면 ConversationListResponseDto에 합친다.
@ApiExtraModels(UserDto)
export class ConversationDto {
  @ApiProperty({
    example: '1',
    description: '회의록 pk',
  })
  @IsNotEmpty()
  pk: number;

  @ApiProperty({
    example: '1',
    description: 'creator pk',
  })
  @IsNotEmpty()
  creatorPk: number;

  @ApiProperty({
    example: '1',
    description: 'participant pk',
  })
  @IsNotEmpty()
  participantPk: number;

  @ApiProperty({
    example: '1',
    description: 'conversationDatas Pk',
  })
  @IsNotEmpty()
  dataPk: number;

  @ApiProperty({
    example: '10월 17일 로그인 구현 PR',
    description: 'Conversation Title / 회의 제목',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '2024-04-12 14:00:00',
    description: '회의 시작 시간',
  })
  @IsNotEmpty()
  startedAt: Date;

  @ApiProperty({
    example: '2024-04-12 15:00:00',
    description: '회의 종료 시간',
  })
  @IsNotEmpty()
  finishedAt: Date;

  @IsNotEmpty()
  creator: UserDto;

  @IsNotEmpty()
  participant: UserDto;
}
