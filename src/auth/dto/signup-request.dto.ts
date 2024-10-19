import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({
    example: 'cotmd6203@naver.com',
    description: 'user email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123!',
    description: 'user password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: '임채승',
    description: 'user name',
  })
  @IsString()
  name: string;
}
