import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import * as Promt from './prompt';

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
}
