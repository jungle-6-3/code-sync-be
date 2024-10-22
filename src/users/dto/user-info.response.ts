import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class UserInfoDTO {
  @ApiProperty({
    example: 'whguddnr9@github.com',
    description: 'user email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '조형욱',
    description: 'user name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor(email: string, name: string) {
    this.email = email;
    this.name = name;
  }
}
