import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class AuthResponseDto {
  @ApiProperty()
  @IsBoolean()
  success: boolean;

  @ApiProperty()
  @IsNumber()
  status?: number;

  @ApiProperty()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsString()
  message: string;
}
