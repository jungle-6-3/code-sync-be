import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class LoginRequestDto {
  @ApiProperty({
    example: 'whguddnr9@github.com',
    description: 'user email for login',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Sync-code123!',
    description: 'user password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
