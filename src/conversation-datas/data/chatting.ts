export class ChatData {
  private chats: chat[];
  uuid: string;

  public addChat(chat: chat) {
    this.chats.push(chat);
  }

  public toFile() {
    const stringChat = JSON.stringify(this.chats);
    const fileData = {
      fileName: 'Chat',
      file: stringChat,
      extension: 'txt',
      uuid: this.uuid,
    };

    return fileData;
  }

  constructor(uuid: string) {
    this.chats = [];
    this.uuid = uuid;
  }
}

interface chat {
  date: Date;
  name: string;
  content: string;
}
