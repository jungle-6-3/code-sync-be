export class ChatData {
  private chats: chat[];

  public addChat(chat: chat) {
    this.chats.push(chat);
  }

  public toFile(uuid: string) {
    const chat = JSON.stringify(this.chats);
    const stringChat = Buffer.from(chat).toString('utf-8');
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
  email: string;
  message: string;
}
