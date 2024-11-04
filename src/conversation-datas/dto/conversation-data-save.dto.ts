import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class SaveDataDto {
  @ApiProperty({
    example: '{metadata}',
    description: '저장할 데이터 내용',
  })
  @IsNotEmpty()
  @IsString()
  data: string;

  @ApiProperty({
    example: 'true',
    description: '데이터 공유 여부',
  })
  @IsNotEmpty()
  @IsBoolean()
  isShared: boolean;
}

@ApiExtraModels(SaveDataDto)
export class ConversationDataSaveDto {
  chat?: SaveDataDto;

  board?: SaveDataDto;

  voice?: SaveDataDto;

  note?: SaveDataDto;

  @ApiProperty({
    example: 'true',
    description: '회의정보 공유 여부',
  })
  @IsNotEmpty()
  canShared: boolean;
}
