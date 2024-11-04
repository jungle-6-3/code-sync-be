export class FileConfig {
  static readonly fileConfigs = {
    chat: {
      ContentType: 'text/plain',
    },
    drawBoard: {
      ContentType: 'application/json',
    },
    voice: {
      ContentType: 'audio/mpeg',
    },
    note: {
      ContentType: 'application/json',
    },
  } as const;
}
