import { useCallback, useEffect, useState } from 'react';

import { INITIAL_TOKENS_STATE } from '../../constants';
import type { RepoKind } from '../../types';
import { generateRequestId, postMessage } from '../../utils/message';

import { useMessage } from './useMessage';

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
  const [lastCheckId, setLastCheckId] = useState<string | null>(null);

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
    const reqId = generateRequestId();
    setLastCheckId(reqId);
    setTokenVerification(true);

    postMessage({
      type: 'check-token',
      payload: { kind: repo },
      reqId,
    });
  }, [repo]);

  useMessage({ types: ['init', 'token-saved', 'token-cleared'] }, (message) => {
    switch (message.type) {
      case 'init':
        setSavedTokens(message.payload.tokens);
        break;
      case 'token-saved': {
        const saved = message.payload;
        setSavedTokens((prev) => ({ ...prev, [saved.kind]: saved.token }));
        break;
      }
      case 'token-cleared': {
        const kind = message.payload.kind;
        setSavedTokens((prev) => ({ ...prev, [kind]: '' }));
        break;
      }
    }
  });

  useMessage(
    {
      types: ['token-valid', 'error'],
      predicate: (message) =>
        (message.type === 'token-valid' && (!lastCheckId || message.reqId === lastCheckId)) ||
        (message.type === 'error' &&
          message.target === 'check-token' &&
          (!lastCheckId || message.reqId === lastCheckId)),
    },
    () => {
      setTokenVerification(false);
      setLastCheckId(null);
    }
  );

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
