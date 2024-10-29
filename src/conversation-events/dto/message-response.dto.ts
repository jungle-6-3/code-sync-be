import { IsNotEmpty } from 'class-validator';

export class MessageResponseDto {
  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  email: string;

  constructor(name: string, message: string, email: string) {
    this.date = createDate();
    this.name = name;
    this.email = email;
    this.message = message;
  }
}

function createDate() {
  const now = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return now;
}
