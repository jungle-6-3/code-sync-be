import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileInfoDto {
  @ApiProperty({
    example: '{uuid}chat',
    description: 'file name = conversation_uuid+file_extension',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    example: 'IDd7898dxcKDfu3u1',
    description: 'fileInfo (may be formating info)',
  })
  @IsNotEmpty()
  file: Express.Multer.File;

  @ApiProperty({
    example: 'png',
    description: 'file extension .png, .txt, .mp3, etc...',
  })
  @IsString()
  @IsNotEmpty()
  extension: string;
}
