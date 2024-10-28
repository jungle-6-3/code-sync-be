export class ChatData {
  private chats: chat[];

  public addChat(chat: chat) {
    this.chats.push(chat);
  }

  public toFile(uuid: string) {
    const stringChat = JSON.stringify(this.chats);
    const fileData = {
      fileName: 'Chat',
      file: stringChat,
      extension: 'txt',
      uuid: uuid,
    };

    return fileData;
  }

  constructor() {
    this.chats = [];
  }
}

interface chat {
  date: string;
  name: string;
  content: string;
}
