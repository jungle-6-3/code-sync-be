export class CreateMessage {
  date: string;
  name: string;
  message: string;

  constructor(date: string, name: string, message: string) {
    this.date = date;
    this.name = name;
    this.message = message;
  }
}
