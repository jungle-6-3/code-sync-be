export class FileConfig {
  static fileTypes = [
    'chat',
    'drawBoard',
    'voice',
    'note',
    'codeEditor',
    'summary',
  ] as const;
  static fileUpdateTypes = ['drawBoard', 'note', 'summary'] as const;
  static SHARED_COLUMN_MAP = {
    chat: 'isChattingShared',
    drawBoard: 'isDrawBoardShared',
    voice: 'isVoiceShared',
    note: 'isNoteShared',
    codeEditor: 'isCodeEditorShared',
    summary: 'isSummaryShared',
  } as const;

  static fileTypeKeys = {
    chat: 'chattingKey',
    drawBoard: 'drawBoardKey',
    voice: 'voiceKey',
    note: 'noteKey',
    codeEditor: 'codeEditorKey',
    summary: 'summaryKey',
  } as const;
}
