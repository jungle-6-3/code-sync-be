import { SaveDataDtoConversation } from './save-data-dto-convesation.interface';
import * as Y from 'yjs';
import { YjsService } from 'src/yjs/yjs.service';
import { YjsDocProvider } from 'src/yjs/yjs-doc-provider.interface';

export class Note implements SaveDataDtoConversation {
  private docPromise: Promise<Y.Doc>;

  public async toSaveDataDto() {
    return {
      data: await this.yjsService.encodeDoc(await this.docPromise),
      isShared: true,
    };
  }

  constructor(
    private yjsService: YjsService,
    yjsDocProvider: YjsDocProvider,
  ) {
    this.docPromise = this.yjsService.getNoteDoc(yjsDocProvider);
  }
}
