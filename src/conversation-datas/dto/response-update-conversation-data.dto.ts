import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ResponseUpdateConversationDatasDto {
  chat: ResponseDataDto;
  drawBoard: ResponseDataDto;
  note: ResponseDataDto;
  codeEditor: ResponseDataDto;
  voice: ResponseDataDto;
}
export class ResponseDataDto {
  @ApiProperty({
    example: 'code-sync.dev/amazone.s3.............',
    description: 'url',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    example: 'true',
    description: '데이터 공유 여부',
  })
  @IsBoolean()
  isShared?: boolean;
}
