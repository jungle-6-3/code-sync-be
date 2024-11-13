import { SaveDataDtoConversation } from './save-data-dto-convesation.interface';

export class Chatting implements SaveDataDtoConversation {
  private chats: Chat[];

  public addChat(chat: Chat) {
    this.chats.push(chat);
  }

  public toSaveDataDto() {
    return {
      data: JSON.stringify(this.chats),
      isShared: true,
    };
  }

  constructor() {
    this.chats = [];
  }
}

interface Chat {
  date: string;
  name: string;
  email: string;
  message: string;
}
