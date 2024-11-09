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
      console.log('response', response.choices[0].message.content);
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      this.logger.error(error.stack);
      return voiceChatChunk;
    }
  }

  private async beautifyVoiceChats(voiceChats: VoiceChat[]) {
    let currentChunk: VoiceChat[] = [];
    let convertedVoiceChats: VoiceChat[] = [];
    let currentChunkLength = 0;
    const CHUNK_SIZE = 2000;

    for (const chat of voiceChats) {
      const messageLength = JSON.stringify(chat).length;

      if (currentChunkLength + messageLength <= CHUNK_SIZE) {
        currentChunk.push(chat);
        currentChunkLength += messageLength;
      } else {
        convertedVoiceChats = convertedVoiceChats.concat(
          await this.beautifyVoiceChatChunk(currentChunk),
        );
        console.log('converted chats', convertedVoiceChats);
        currentChunk = [chat];
        currentChunkLength = messageLength;
      }
    }

    if (currentChunk.length > 0) {
      convertedVoiceChats = convertedVoiceChats.concat(
        await this.beautifyVoiceChatChunk(currentChunk),
      );
    }
    console.log('final output', convertedVoiceChats);
    return convertedVoiceChats;
  }

  private async summaryVoiceChatting(voiceChats: VoiceChat[]) {
    return 'temp summary';
  }

  async setVoiceChatting(voieChatting: VoiceChatting) {
    // TODO: beautify voice chatting
    const originalChats = voieChatting.voiceChats;
    voieChatting.voiceChats = await this.beautifyVoiceChats(originalChats);
    // TODO: summary voice chatting
    voieChatting.voiceSummary = await this.summaryVoiceChatting(
      voieChatting.voiceChats,
    );
    return;
  }
}
