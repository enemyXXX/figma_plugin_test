import { useEffect, useMemo, useState } from 'react';

import { REPO_OPTIONS } from '../../constants';
import type { RepoKind } from '../../types';
import { isPluginMessageEvent, RepoOption } from '../utils';

interface UseActiveRepoReturn {
  activeRepoOption: RepoOption;
}
export const useActiveRepo = (): UseActiveRepoReturn => {
  const [activeRepo, setActiveRepo] = useState<RepoKind>('public-icons');

  useEffect(() => {
    const handler = (event: MessageEvent<unknown>): void => {
      if (!isPluginMessageEvent(event)) return;

      const message = event.data.pluginMessage;

      switch (message.type) {
        case 'init': {
          setActiveRepo(message.payload.selected);
          break;
        }
        case 'selected-saved': {
          setActiveRepo(message.payload.kind);
          break;
        }
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, []);

  const activeRepoOption: RepoOption = useMemo(() => {
    return REPO_OPTIONS.find((o) => o.value === activeRepo) || REPO_OPTIONS[0];
  }, [activeRepo]);

  return {
    activeRepoOption,
  };
};
