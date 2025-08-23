import { useEffect, useState } from 'react';

import { isPluginMessageEvent } from '../utils';

export interface UseSelectionReturn {
  selectedNodes: SceneNode[];
}

export const useSelection = (): UseSelectionReturn => {
  const [selectedNodes, setSelectedNodes] = useState([]);

  useEffect(() => {
    const handler = (event: MessageEvent<unknown>): void => {
      if (!isPluginMessageEvent(event)) return;
      const msg = event.data.pluginMessage;

      if (msg.type === 'selection') {
        setSelectedNodes(msg.payload);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return { selectedNodes };
};
