import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({
    example: 'whguddnr9@github.com',
    description: 'user email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Sync-code123!',
    description: 'user password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: '조형욱',
    description: 'user name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
