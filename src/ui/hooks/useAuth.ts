import { useCallback, useEffect, useState } from 'react';

import { INITIAL_TOKENS_STATE } from '../../constants';
import type { RepoKind } from '../../types';
import { postMessage } from '../../utils/message';
import { isPluginMessageEvent } from '../utils';

interface UseAuthReturn {
  updateRepo: (repo: RepoKind) => void;
  token: string;
  savedToken: string;
  updateToken: (value: string) => void;
  saveToken: VoidFunction;
  clearToken: VoidFunction;
  checkToken: VoidFunction;
  tokenVerification: boolean;
  isTokenSaved: boolean;
}

export const useAuth = (repo: RepoKind): UseAuthReturn => {
  const [savedTokens, setSavedTokens] = useState(INITIAL_TOKENS_STATE);
  const [tokens, setTokens] = useState(INITIAL_TOKENS_STATE);
  const [tokenVerification, setTokenVerification] = useState(false);

  useEffect(() => {
    setTokens(savedTokens);
  }, [savedTokens]);

  const updateToken = useCallback(
    (value: string) => {
      setTokens((prev) => ({ ...prev, [repo]: value }));
    },
    [repo]
  );

  const handleActiveRepoUpdate = useCallback((repo: RepoKind) => {
    postMessage({ type: 'set-selected', payload: { kind: repo } });
  }, []);

  const saveToken = useCallback(() => {
    postMessage({ type: 'save-token', payload: { kind: repo, token: tokens[repo] } });
  }, [repo, tokens]);

  const clearToken = useCallback(() => {
    postMessage({ type: 'clear-token', payload: { kind: repo } });
  }, [repo]);

  const checkToken = useCallback(() => {
    setTokenVerification(true);
    postMessage({ type: 'check-token', payload: { kind: repo } });
  }, [repo]);

  useEffect(() => {
    const handler = (event: MessageEvent<unknown>): void => {
      if (!isPluginMessageEvent(event)) return;

      const message = event.data.pluginMessage;

      switch (message.type) {
        case 'init': {
          setSavedTokens(message.payload.tokens);
          break;
        }
        case 'token-saved': {
          const savedData = message.payload;
          setSavedTokens((prev) => ({ ...prev, [savedData.kind]: savedData.token }));
          break;
        }
        case 'token-cleared': {
          const kind = message.payload.kind;
          setSavedTokens((prev) => ({ ...prev, [kind]: '' }));
          break;
        }
        case 'token-ok': {
          setTokenVerification(false);
          break;
        }
        case 'token-error':
          setTokenVerification(false);
          break;
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, []);

  return {
    updateRepo: handleActiveRepoUpdate,
    token: tokens[repo],
    savedToken: savedTokens[repo],
    updateToken,
    saveToken,
    clearToken,
    checkToken,
    tokenVerification,
    isTokenSaved: !!savedTokens[repo] && savedTokens[repo] === tokens[repo],
  };
};
