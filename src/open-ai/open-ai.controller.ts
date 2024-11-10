import { Controller, Post, Body } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OpenAITestDto } from './dto/open-AI-test.dto';
import { VoiceDataDto } from './dto/voice-data.dto';

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

  @ApiOperation({
    summary: '채팅 내용 개선',
    description: `STT로 인해 부정확한 문장을 좋게 수정. 누군가의 돈을 거덜내기 싫으면 적당히 써주세요.`,
  })
  @Post('beauty')
  async beautyVoice(@Body() { voiceChats }: VoiceDataDto) {
    return await this.openAiService.beautifyVoiceChats(voiceChats);
  }

  @ApiOperation({
    summary: 'OpenAI API와 간단한 대화',
    description: `음성 채팅 내용 요약. 누군가의 돈을 거덜내기 싫으면 적당히 써주세요.`,
  })
  @Post('summary')
  async summaryVoice(@Body() { voiceChats }: VoiceDataDto) {
    return await this.openAiService.summaryVoiceChatting(voiceChats);
  }
}
