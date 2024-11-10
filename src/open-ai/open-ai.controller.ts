import { Controller, Post, Body } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OpenAITestDto } from './dto/open-AI-test.dto';

// TODO: 최종 배포할 땐, open ai 관련 api 모두 삭제하기
@ApiTags('Open AI API')
@Controller('open-ai')
export class OpenAiController {
  constructor(private readonly openAiService: OpenAiService) {}

  @ApiOperation({
    summary: 'OpenAI API와 간단한 대화',
    description: `OpenAI API가 작동하는지 확인한다. 누군가의 돈을 거덜내기 싫으면 적당히 써주세요.`,
  })
  @Post('test')
  async test(@Body() { text }: OpenAITestDto) {
    return await this.openAiService.test(text);
  }
}
