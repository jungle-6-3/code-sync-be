export class FileConfig {
  static fileTypes = [
    'chat',
    'drawBoard',
    'voice',
    'note',
    'codeEditor',
    'summery,',
  ] as const;
  static fileUpdateTypes = ['drawBoard', 'note'] as const;
  static SHARED_COLUMN_MAP = {
    chat: 'isChattingShared',
    drawBoard: 'isDrawBoardShared',
    voice: 'isVoiceShared',
    note: 'isNoteShared',
    codeEditor: 'isCodeEditorShared',
    summery: 'isSummeryShared',
  } as const;

  static fileTypeKeys = {
    chat: 'chattingKey',
    drawBoard: 'drawBoardKey',
    voice: 'voiceKey',
    note: 'noteKey',
    codeEditor: 'codeEditorKey',
    summery: 'summeryKey',
  } as const;
}
