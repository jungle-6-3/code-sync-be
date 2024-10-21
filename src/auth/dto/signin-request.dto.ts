import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class SignInRequestDto {
  @ApiProperty({
    example: 'whguddnr9@github.com',
    description: 'user email for login',
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
}
