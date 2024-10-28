export class CreateMessage {
  date: string;
  name: string;
  content: string;

  constructor(date: string, name: string, content: string) {
    this.date = date;
    this.name = name;
    this.content = content;
  }
}
