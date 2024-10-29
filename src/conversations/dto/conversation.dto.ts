import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

// TODO: 하나만 조회하거나 하나의 conversation에 대해서 확인하는 로직없다면 ConversationListResponseDto에 합친다.
export class ConversationDto {
  @ApiProperty({
    example: '4069e5fa-7e24-4be0-958b-999aa8922e13',
    description: 'Conversation UUID / 회의 UUID',
  })
  @IsNotEmpty()
  uuid: string;

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

  @ApiProperty({
    example: '4069e5fa-7e24-4be0-958b-999aa8922e13',
    description: '회의록 공유 Url',
  })
  @IsNotEmpty()
  shareUrl: string;

  @ApiProperty({
    example: 'true',
    description: '회의 공유 가능 여부',
  })
  @IsNotEmpty()
  canShared: boolean;

  @ApiProperty({
    example: 'whguddnr9@github.com',
    description: 'creators email/회의 개설자 이메일',
  })
  @IsNotEmpty()
  creatorEmail: string;

  @ApiProperty({
    example: 'whguddnr9@github.com',
    description: 'creators email/회의 개설자 이름',
  })
  @IsNotEmpty()
  creatorName: string;

  @ApiProperty({
    example: 'pig19980@github.com',
    description: 'creators email/회의 참석자 이메일',
  })
  @IsNotEmpty()
  @IsNotEmpty()
  participantEmail: string;

  @ApiProperty({
    example: '지창근',
    description: 'creators email/회의 참석자 이름',
  })
  @IsNotEmpty()
  partipantName: string;
}
