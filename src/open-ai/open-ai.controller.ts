import { Controller, Post, Body } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';

@Controller('open-ai')
export class OpenAiController {
  constructor(private readonly openAiService: OpenAiService) {}

  @Post('test')
  async test(@Body() { text }: { text: string }) {
    return await this.openAiService.test(text);
  }
}
