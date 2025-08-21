import { useCallback, useEffect, useMemo, useState } from 'react';

import type { PluginToUIMessage, RepoKind, UIToPluginMessage } from '../../types';
import { ActionStatus } from '../../types';

const isPluginMessageEvent = (
  event: MessageEvent<unknown>
): event is MessageEvent<{ pluginMessage: PluginToUIMessage }> => {
  const data = event.data as Record<string, unknown> | null;
  return !!data && typeof data === 'object' && 'pluginMessage' in data;
};

interface UseRepoReturn {
  repo: RepoKind;
  updateRepo: (repo: RepoKind) => void;
  token: string;
  updateToken: (value: string) => void;
  status: ActionStatus | null;
  saveToken: VoidFunction;
  clearToken: VoidFunction;
  checkToken: VoidFunction;
}

export const useRepo = (): UseRepoReturn => {
  const [repo, setRepo] = useState<RepoKind>('public-icons');
  const [tokens, setTokens] = useState<Record<RepoKind, string>>({
    'public-icons': '',
    'private-icons': '',
    'internal-images': '',
  });
  const [status, setStatus] = useState<ActionStatus | null>(null);

  const token: string = useMemo(() => {
    return tokens[repo];
  }, [tokens, repo]);

  const updateToken = useCallback(
    (value: string) => {
      setTokens((prev) => ({ ...prev, [repo]: value }));
    },
    [repo]
  );

  const postMessage = (message: UIToPluginMessage) => {
    window.parent.postMessage({ pluginMessage: message }, '*');
  };

  const updateRepo = useCallback((repo: RepoKind) => {
    setRepo(repo);
    postMessage({ type: 'set-selected', payload: { kind: repo } });
  }, []);

  const saveToken = useCallback(() => {
    postMessage({ type: 'save-token', payload: { kind: repo, token } });
  }, [repo, token]);

  const clearToken = useCallback(() => {
    postMessage({ type: 'clear-token', payload: { kind: repo } });
  }, [repo]);

  const checkToken = useCallback(() => {
    postMessage({ type: 'check-token', payload: { kind: repo } });
  }, [repo]);

  useEffect(() => {
    const handler = (event: MessageEvent<unknown>): void => {
      if (!isPluginMessageEvent(event)) return;
      const msg = event.data.pluginMessage;

      switch (msg.type) {
        case 'init': {
          setRepo(msg.payload.selected);
          setTokens(msg.payload.tokens);
          break;
        }
        case 'selected-saved': {
          break;
        }
        case 'token-saved': {
          setStatus({ type: 'success', message: 'Токен сохранен для выбранного репозитория' });
          break;
        }
        case 'token-cleared': {
          const kind = msg.payload.kind;
          setTokens((prev) => ({ ...prev, [kind]: '' }));
          setStatus({ type: 'success', message: 'Токен удалён для выбранного репозитория' });
          break;
        }
        case 'token-ok': {
          setStatus({
            type: 'success',
            message: 'Токен валиден (' + String(msg.payload.login) + ')',
          });
          break;
        }
        case 'error': {
          setStatus({ type: 'fail', message: 'Ошибка: ' + String(msg.message) });
          break;
        }
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, []);

  return {
    repo,
    updateRepo,
    token,
    updateToken,
    status,
    saveToken,
    clearToken,
    checkToken,
  };
};
