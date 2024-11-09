import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

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
        messages: [
          {
            role: 'system',
            content:
              '너는 openai에 대해 설명해주는 비서야. 주어진 text를 보고 할 수 있는 일에 대해 말해줘.',
          },
          { role: 'user', content: text },
        ],
      });
      return response.choices[0].message?.content || 'No response generated';
    } catch (error) {
      this.logger.error(error.stack);
      return 'Error generating response';
    }
  }
}
