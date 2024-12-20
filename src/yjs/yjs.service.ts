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

  async getDrawBoardDoc(yjsDocProvider: YjsDocProvider) {
    const { doc } = yjsDocProvider;
    const partialElementsElement = doc.getArray<Y.Map<unknown>>('elements');
    const partialAssetsElement = doc.getMap('assets');

    const coppiedDoc = new Y.Doc();
    const coppiedElementsElement =
      coppiedDoc.getArray<Y.Map<unknown>>('elements');
    const coppiedAssetsElement = coppiedDoc.getMap('assets');

    partialElementsElement.toArray().forEach((value) => {
      coppiedElementsElement.push([value.clone()]);
    });

    for (const [key, value] of partialAssetsElement) {
      coppiedAssetsElement.set(key, value);
    }

    return coppiedDoc;
  }

  async getNoteDoc(yjsDocProvider: YjsDocProvider) {
    const { doc } = yjsDocProvider;
    const coppiedDoc = new Y.Doc();

    const partialElement = doc.getXmlFragment('document-store');
    const coppiedElement = coppiedDoc.getXmlFragment('document-store');

    if (partialElement.firstChild) {
      coppiedElement.push([partialElement.firstChild.clone()]);
    }
    // for (const paragraph of partialElement.createTreeWalker(() => true)) {
    //   coppiedElement.push([paragraph.clone() as Y.XmlElement]);
    // }
    return coppiedDoc;
  }

  async getCodeEditorDoc(yjsDocProvider: YjsDocProvider) {
    const keys = ['assets', 'elements', 'document-store'];
    const { doc } = yjsDocProvider;
    const coppiedDoc = new Y.Doc();

    doc.share.forEach((value, key) => {
      if (keys.includes(key)) {
        return;
      }
      const partialElement = doc.getText(key);
      const coppiedElement = coppiedDoc.getText(key);
      coppiedElement.insert(0, partialElement.toString());
    });

    return coppiedDoc;
  }

  async encodeDoc(doc: Y.Doc) {
    const documentState = Y.encodeStateAsUpdate(doc);
    const base64Encoded = fromUint8Array(documentState);
    return base64Encoded;
  }
}
