import { Injectable } from '@nestjs/common';
import { YjsDocProvider } from './yjs-doc-provider.interface';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { fromUint8Array } from 'js-base64';

@Injectable()
export class YjsService {
  initYjsDocProvider(yjsDocProvider: YjsDocProvider, uuid: string) {
    yjsDocProvider.doc = new Y.Doc();
    yjsDocProvider.provider = new WebsocketProvider(
      'wss://code-sync.net/yjs/',
      `${uuid}`,
      yjsDocProvider.doc,
      {
        WebSocketPolyfill: require('ws'),
        connect: true,
        maxBackoffTime: 2500,
      },
    );
  }

  closeYjsDocProvider(yjsDocProvider: YjsDocProvider) {
    const { provider } = yjsDocProvider;
    provider.disconnect();
  }

  getPartialDoc(yjsDocProvider: YjsDocProvider, key: string) {
    const { doc } = yjsDocProvider;
    const coppiedDoc = new Y.Doc();

    const partialElement = doc.getArray<Y.Map<unknown>>(key);
    const coppiedElement = coppiedDoc.getArray<Y.Map<unknown>>(key);

    partialElement.toArray().forEach((item) => {
      coppiedElement.push([item.clone()]);
    });

    return coppiedDoc;
  }

  encodeDoc(doc: Y.Doc) {
    const documentState = Y.encodeStateAsUpdate(doc);
    const base64Encoded = fromUint8Array(documentState);
    return base64Encoded;
  }
}
