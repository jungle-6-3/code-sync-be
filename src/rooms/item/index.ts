import { Chatting } from 'src/conversation-datas/data/chatting';
import { User } from 'src/users/entities/user.entity';
import { RoomEvent } from './room-event';
import { YjsDocProvider } from 'src/yjs/yjs-doc-provider.interface';
import { DrawBoard } from 'src/conversation-datas/data/drawBoard';
import { Note } from 'src/conversation-datas/data/note';
import { CodeEditor } from 'src/conversation-datas/data/codeEditor';

export class Room extends RoomEvent {
  creatorPk: number;
  participantPk: number;
  startedAt: Date;
  finishedAt: Date;
  prUrl: string;

  yjsDocProvider: YjsDocProvider;
  data: RoomData;

  constructor(uuid: string, creator: User, prUrl: string) {
    super(uuid);
    this.creatorPk = creator.pk;
    this.prUrl = prUrl;
    this.startedAt = new Date();
    this.data = {
      chat: new Chatting(),
    };
  }
}

interface RoomData {
  chat: Chatting;
  drawBoard?: DrawBoard;
  note?: Note;
  codeEditor?: CodeEditor;
}
