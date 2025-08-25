import { useState } from 'react';

import { useMessage } from './useMessage';

export interface UseSelectionReturn {
  selectedNodesCount: number;
}

export const useSelection = (): UseSelectionReturn => {
  const [selectedNodesCount, setSelectedNodesCount] = useState(0);

  useMessage({ types: ['selection'] }, (message) => {
    if (message.type === 'selection') setSelectedNodesCount(message.payload);
  });

  return { selectedNodesCount: selectedNodesCount };
};
