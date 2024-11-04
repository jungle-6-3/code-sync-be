import { Module } from '@nestjs/common';
import { SaveDataDtoConversation } from './save-data-dto-convesation.interface';
import * as Y from 'yjs';
import { YjsModule } from 'src/yjs/yjs.module';
import { YjsService } from 'src/yjs/yjs.service';
import { YjsDocProvider } from 'src/yjs/yjs-doc-provider.interface';

@Module({
  imports: [YjsModule],
})
export class drawBoard implements SaveDataDtoConversation {
  private doc: Y.Doc;

  public toSaveDataDto() {
    return {
      data: this.yjsService.encodeDoc(this.doc),
      isShared: false,
    };
  }

  constructor(
    private yjsService: YjsService,
    yjsDocProvider: YjsDocProvider,
  ) {
    this.doc = this.yjsService.getPartialDoc(yjsDocProvider, 'elements');
  }
}
