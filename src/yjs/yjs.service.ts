import { Injectable } from '@nestjs/common';
import { YjsDocProvider } from './yjs-doc-provider.interface';
import { ConfigService } from '@nestjs/config';
import { Room } from 'src/rooms/item';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { fromUint8Array } from 'js-base64';

@Injectable()
export class YjsService {
  constructor(private configService: ConfigService) {}

  async initYjsDocProvider(room: Room) {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider(
      this.configService.get('YJS_URL'),
      `${room.uuid}`,
      doc,
      {
        WebSocketPolyfill: require('ws'),
        connect: true,
        maxBackoffTime: 2500,
      },
    );
    room.yjsDocProvider = { doc, provider };
  }

  async closeYjsDocProvider(yjsDocProvider: YjsDocProvider) {
    const { provider } = yjsDocProvider;
    provider.disconnect();
  }

  async getPartialDoc(yjsDocProvider: YjsDocProvider, key: string) {
    const { doc } = yjsDocProvider;
    const coppiedDoc = new Y.Doc();

    const partialElement = doc.getArray<Y.Map<unknown>>(key);
    const coppiedElement = coppiedDoc.getArray<Y.Map<unknown>>(key);

    partialElement.toArray().forEach((item) => {
      coppiedElement.push([item.clone()]);
    });

    return coppiedDoc;
  }

  async encodeDoc(doc: Y.Doc) {
    const documentState = Y.encodeStateAsUpdate(doc);
    const base64Encoded = fromUint8Array(documentState);
    return base64Encoded;
  }
}
