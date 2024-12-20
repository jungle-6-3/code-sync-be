import { Injectable, Logger } from '@nestjs/common';
import { Room } from './item';
import { v4 as _uuid } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { RoomEventService } from './item/room-event/room-event.service';
import { ConversationsService } from 'src/conversations/conversations.service';
import { RoomSaveDto } from 'src/conversations/dto/room-save.dto';
import { UsersService } from 'src/users/users.service';
import {
  ConversationDataSaveDto,
  SaveDataDto,
} from 'src/conversation-datas/dto/conversation-data-save.dto';
import { OpenAiService } from 'src/open-ai/open-ai.service';

@Injectable()
export class RoomsService {
  private roomsById: Map<string, Room>;
  logger: Logger = new Logger('RoomsService');

  constructor(
    private roomEventsService: RoomEventService,
    private conversationsService: ConversationsService,
    private usersService: UsersService,
    private openAiService: OpenAiService,
  ) {
    this.roomsById = new Map();
  }

  async createRoom(creator: User, prUrl: string) {
    const roomUuid = _uuid();
    const newRoom = new Room(roomUuid, creator, prUrl);
    this.roomsById.set(roomUuid, newRoom);
    this.roomEventsService.deleteRoomAfter(newRoom, 30);
    this.logger.log(`${creator.name}가 ${roomUuid}를 생성`);
    return roomUuid;
  }

  async saveRoom(room: Room) {
    const { creatorPk, participantPk, startedAt, finishedAt } = room;
    const participant = await this.usersService.fineOneByPk(room.participantPk);
    const title = `${participant.name}와의 대화`;
    const { chat, drawBoard, codeEditor, note, voiceChat } = room.data;

    await this.openAiService.setVoiceChatting(voiceChat);
    const data: ConversationDataSaveDto = {
      chat: chat.toSaveDataDto(),
      drawBoard: await drawBoard.toSaveDataDto(),
      codeEditor: await codeEditor.toSaveDataDto(),
      note: await note.toSaveDataDto(),
      voice: await voiceChat.toSaveVoiceDataDto(),
      summary: await voiceChat.toSaveSummaryDataDto(),
      canShared: false,
    };

    const roomSaveDto: RoomSaveDto = {
      creatorPk,
      participantPk,
      title,
      startedAt,
      finishedAt,
      data,
    };

    const conversation =
      await this.conversationsService.createConversation(roomSaveDto);

    return conversation.dataPk;
  }

  async findRoomByUuid(uuid: string) {
    return this.roomsById.get(uuid);
  }

  async deleteRoombyUuid(uuid: string) {
    this.roomsById.delete(uuid);
    this.logger.log(`${uuid}가 삭제 됨`);
  }
}
