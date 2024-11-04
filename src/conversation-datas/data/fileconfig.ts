export class FileConfig {
  static readonly fileConfigs = {
    chat: {
      ContentType: 'text/plain',
    },
    board: {
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
