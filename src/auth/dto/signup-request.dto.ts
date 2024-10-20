import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({
    example: 'whguddnr9@github.com',
    description: 'user email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Sync-code123!',
    description: 'user password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: '조형욱',
    description: 'user name',
  })
  @IsString()
  name: string;
}
