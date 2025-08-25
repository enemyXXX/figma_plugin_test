import type { PluginToUIMessage } from '../types';

import { isPluginMessageEvent } from './utils';

type RawWindowEvent = MessageEvent<unknown>;
type Listener = (msg: PluginToUIMessage) => void;

let installed = false;
const listeners = new Set<Listener>();

function onWindowMessage(event: RawWindowEvent): void {
  if (!isPluginMessageEvent(event)) return;
  const message = event.data.pluginMessage;

  listeners.forEach((fn) => fn(message));
}

export function subscribe(fn: Listener): () => void {
  if (!installed) {
    window.addEventListener('message', onWindowMessage);
    installed = true;
  }

  listeners.add(fn);

  return () => {
    listeners.delete(fn);

    if (installed && listeners.size === 0) {
      window.removeEventListener('message', onWindowMessage);
      installed = false;
    }
  };
}
