import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class SaveDatasDto {
  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'UUID used in the review',
  })
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @ApiProperty({
    example:
      'https://code-sync-s3-datas.s3.ap-northeast-2.amazonaws.com/useruuid/chattingdata2',
    description: 'Save Data S3 Url',
  })
  @IsString()
  @IsNotEmpty()
  noteUrl: string;

  @ApiProperty({
    example:
      'https://code-sync-s3-datas.s3.ap-northeast-2.amazonaws.com/useruuid/chattingdata2',
    description: 'Save Data S3 Url',
  })
  @IsString()
  @IsNotEmpty()
  drawBoardUrl: string;

  @ApiProperty({
    example:
      'https://code-sync-s3-datas.s3.ap-northeast-2.amazonaws.com/useruuid/chattingdata2',
    description: 'Save Data S3 Url',
  })
  @IsString()
  @IsNotEmpty()
  chattingUrl: string;

  @ApiProperty({
    example:
      'https://code-sync-s3-datas.s3.ap-northeast-2.amazonaws.com/useruuid/chattingdata2',
    description: 'Save Data S3 Url',
  })
  @IsString()
  @IsNotEmpty()
  voiceUrl: string;

  @ApiProperty({
    example: 'true',
    description: '노트 공유 여부',
  })
  @IsBoolean()
  @IsNotEmpty()
  isNoteShared: boolean;

  @ApiProperty({
    example: 'true',
    description: '그림판 공유 여부',
  })
  @IsBoolean()
  @IsNotEmpty()
  isDrawBoardShared: boolean;

  @ApiProperty({
    example: 'true',
    description: '채팅 공유 여부',
  })
  @IsBoolean()
  @IsNotEmpty()
  isChattingShared: boolean;

  @ApiProperty({
    example: 'true',
    description: '영상/음성 공유 여부',
  })
  @IsBoolean()
  @IsNotEmpty()
  isVoiceShared: boolean;

  @ApiProperty({
    example: 'true',
    description: '공유 여부',
  })
  @IsBoolean()
  @IsNotEmpty()
  canShared: boolean;
}
