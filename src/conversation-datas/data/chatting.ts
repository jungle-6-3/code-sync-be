export class ChatData {
  private chats: chat[];
  uuid: string;

  public addChat(chat: chat) {
    this.chats.push(chat);
  }

  public toString() {
    return JSON.stringify(this.chats);
  }
  public addChat() {
    this.chats.push();
  }
  constructor() {
    this.chats = [];
  }
}

interface chat {
  date: Date;
  name: string;
  content: string;
}
