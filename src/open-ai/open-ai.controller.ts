import { Controller, Post, Body } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TestDto } from './dto/test.dto';

@ApiTags('Open AI API')
@Controller('open-ai')
export class OpenAiController {
  constructor(private readonly openAiService: OpenAiService) {}

  @ApiOperation({
    summary: 'OpenAI API와 간단한 대화',
    description: 'OpenAI API가 작동하는지 확인한다.',
  })
  @Post('test')
  async test(@Body() { text }: TestDto) {
    return await this.openAiService.test(text);
  }
}
