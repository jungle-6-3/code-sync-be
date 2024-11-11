import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ConversationDataSaveDto } from 'src/conversation-datas/dto/conversation-data-save.dto';

export class UpdateConversationDatasDto extends PartialType(
  ConversationDataSaveDto,
) {
  @ApiProperty()
  @IsString()
  title?: string;
}
