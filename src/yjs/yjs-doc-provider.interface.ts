import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export interface YjsDocProvider {
  doc: Y.Doc;
  provider: WebsocketProvider;
}
