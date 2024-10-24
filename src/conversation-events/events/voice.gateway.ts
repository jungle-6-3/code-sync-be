import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTION', 'FETCH', 'Put', 'DELETE'],
    credentials: true,
    transports: ['polling', 'websocket'],
  },
})
export class VoiceGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
