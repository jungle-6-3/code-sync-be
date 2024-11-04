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

//TODO: data를 넣는 것을 구현한 후, @IsNotEmpty() 추가해야 함.
@ApiExtraModels(SaveDataDto)
export class ConversationDataSaveDto {
  @IsNotEmpty()
  chat: SaveDataDto;

  @IsNotEmpty()
  board: SaveDataDto;

  @IsNotEmpty()
  voice: SaveDataDto;

  @IsNotEmpty()
  note: SaveDataDto;

  @ApiProperty({
    example: 'true',
    description: '회의정보 공유 여부',
  })
  @IsNotEmpty()
  canShared: boolean;
}
