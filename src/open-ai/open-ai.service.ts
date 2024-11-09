import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import * as Promt from './prompt';
import {
  VoiceChat,
  VoiceChatting,
} from 'src/conversation-datas/data/voice-chatting';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;
  private logger: Logger;
  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPEN_AI_API_KEY'),
    });
    this.logger = new Logger('OpenAIService');
  }

  async test(text: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [Promt.testSystem, { role: 'user', content: text }],
      });
      return response.choices[0].message?.content || 'No response generated';
    } catch (error) {
      this.logger.error(error.stack);
      return 'Error generating response';
    }
  }

  private async beautifyVoiceChatChunk(
    voiceChatChunk: VoiceChat[],
  ): Promise<VoiceChat[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          Promt.beutifySystem,
          { role: 'user', content: JSON.stringify(voiceChatChunk) },
        ],
      });
      if (!response.choices[0].message) {
        throw new Error('OpenAi로부터 받은 response가 없음.');
      }
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      this.logger.error(error.stack);
      return voiceChatChunk;
    }
  }

  private async beautifyVoiceChats(voiceChats: VoiceChat[]) {
    const CHUNK_SIZE = 2000;
    let currentChunk: VoiceChat[] = [];
    let convertedVoicePromise: Promise<VoiceChat[]>[] = [];
    let currentChunkLength = 0;

    for (const chat of voiceChats) {
      const messageLength = JSON.stringify(chat).length;
      if (currentChunkLength + messageLength <= CHUNK_SIZE) {
        currentChunk.push(chat);
        currentChunkLength += messageLength;
      } else {
        convertedVoicePromise.push(this.beautifyVoiceChatChunk(currentChunk));
        currentChunk = [chat];
        currentChunkLength = messageLength;
      }
    }
    if (currentChunk.length > 0) {
      convertedVoicePromise.push(this.beautifyVoiceChatChunk(currentChunk));
    }

    const convertedVoiceChats = await Promise.all(convertedVoicePromise);
    return convertedVoiceChats.flat();
  }

  private async summaryVoiceChatting(voiceChats: VoiceChat[]) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          Promt.summarySystem,
          { role: 'user', content: JSON.stringify(voiceChats) },
        ],
      });
      if (!response.choices[0].message) {
        throw new Error('OpenAi로부터 받은 response가 없음.');
      }
      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error(error.stack);
      return '요약본이 없습니다.';
    }
  }

  // TODO: prompt 더 좋게 수정 필요 있음.
  // TODO: 실제 배포할 때는 주석 내용으로 교체 필요.
  async setVoiceChatting(voieChatting: VoiceChatting) {
    this.logger.log('Voice 관련 mock data 주입 시작');
    voieChatting.voiceSummary = 'temp-summary';
    // this.logger.log('Voice 관련 OpenAI 서비스 시작');
    // const originalChats = voieChatting.voiceChats;
    // voieChatting.voiceChats = await this.beautifyVoiceChats(originalChats);
    // this.logger.log('STT 변환 변환 완료');
    // voieChatting.voiceSummary = await this.summaryVoiceChatting(
    //   voieChatting.voiceChats,
    // );
    // this.logger.log('대화 요약 완료');
    return;
  }
}
