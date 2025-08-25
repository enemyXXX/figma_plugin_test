import { useEffect } from 'react';

import type { PluginToUIMessage } from '../../types';
import { subscribe } from '../messaging';

type MsgType = PluginToUIMessage['type'];

type Predicate = (message: PluginToUIMessage) => boolean;
type Handler = (message: PluginToUIMessage) => void;

interface Options {
  types?: MsgType[];
  predicate?: Predicate;
}

export function useMessage(opts: Options, handler: Handler): void {
  useEffect(() => {
    return subscribe((message) => {
      if (opts.types && opts.types.indexOf(message.type) === -1) return;

      if (opts.predicate && !opts.predicate(message)) return;

      handler(message);
    });
  }, [JSON.stringify(opts.types)]);
}
