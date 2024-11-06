export class FileConfig {
  static readonly fileConfigs = {
    // TODO : ContentType을 빼고 fileType만 정의 한다. 사용하는 모든 Type에 대해서 나열해 놓는다. (chat, drawBoard, voice, note, codeEditor 등)
    chat: {
      ContentType: 'text/plain',
    },
    drawBoard: {
      ContentType: 'application/json',
    },
    codeEditor: {
      ContentType: 'text/plain',
    },
    note: {
      ContentType: 'application/json',
    },
  } as const;
}
