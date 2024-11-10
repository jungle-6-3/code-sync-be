import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TestDto {
  @ApiProperty({
    example: 'OpenAI API에 대해 설명해줘.',
    description: 'OpenAI API와 대화할 내용',
  })
  @IsNotEmpty()
  @IsString()
  text: string;
}
