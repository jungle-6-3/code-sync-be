import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileInfoDto {
  @ApiProperty({
    example: 'chat',
    description: 'file name',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    example: '[{date:"2024-10-24USD0012, name: "조형욱", content:"hi hi"}]',
    description: 'fileInfo (may be formating info)',
  })
  @IsNotEmpty()
  file: string;

  @ApiProperty({
    example: 'video',
    description: 'file extension .png, .txt, .mp3, etc...',
  })
  @IsString()
  @IsNotEmpty()
  extension: string;

  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'UUID used in the review',
  })
  @IsString()
  @IsNotEmpty()
  uuid: string;
}
