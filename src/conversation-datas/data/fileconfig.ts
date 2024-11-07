export class FileConfig {
  static fileTypes = [
    'chat',
    'drawBoard',
    'voice',
    'note',
    'codeEditor',
  ] as const;
  static fileUpdateTypes = ['drawBoard', 'note'] as const;
  static SHARED_COLUMN_MAP = {
    chat: 'isChattingShared',
    drawBoard: 'isDrawBoardShared',
    voice: 'isVoiceShared',
    note: 'isNoteShared',
    codeEditor: 'isCodeEditorShared',
  } as const;
}
