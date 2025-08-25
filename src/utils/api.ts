import { REPOS } from '../constants';
import { RepoKind } from '../types';

import { hasMessage } from './message';

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

const toApiError = (error: unknown): string => {
  if (hasMessage(error)) return String(error.message);

  return String(error);
};

export const safeFetch = async (
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> => {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (controller) {
    init = Object.assign({}, init, { signal: controller.signal });
  }

  try {
    const request = fetch(url, init);

    const timeout = new Promise<Response>((_, reject) => {
      timeoutId = setTimeout(() => {
        if (controller) controller.abort();

        reject(new Error('Request timed out: ' + url));
      }, timeoutMs);
    });

    const res = (await Promise.race([request, timeout])) as Response;
    if (timeoutId) clearTimeout(timeoutId);
    return res;
  } catch (e) {
    if (timeoutId) clearTimeout(timeoutId);
    throw e;
  }
};

const checkGithubToken = async (
  token: string
): Promise<ApiResult<{ login: string; id?: number }>> => {
  try {
    const res = await safeFetch(
      'https://api.github.com/user',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
          Accept: 'application/vnd.github+json',
        },
      },
      12000
    );

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, status: res.status, error: text || 'GitHub token check failed' };
    }
    const data = (await res.json()) as { login: string; id?: number };
    return { ok: true, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, error: toApiError(e) };
  }
};

const checkGitlabToken = async (
  token: string,
  baseUrl: string
): Promise<ApiResult<{ username: string; id?: number }>> => {
  try {
    const res = await safeFetch(
      baseUrl.replace(/\/+$/, '') + '/api/v4/user',
      {
        method: 'GET',
        headers: { 'Private-Token': token },
      },
      12000
    );

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, status: res.status, error: text || 'GitLab token check failed' };
    }
    const data = (await res.json()) as { username: string; id?: number };
    return { ok: true, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, error: toApiError(e) };
  }
};

export const verifyTokenByKind = async (
  kind: RepoKind,
  token: string
): Promise<ApiResult<{ displayName: string }>> => {
  if (!token) return { ok: false, status: 0, error: 'Токен не задан' };

  if (kind === 'public-icons') {
    const githubResponse = await checkGithubToken(token);

    return githubResponse.ok && githubResponse.data
      ? {
          ok: true,
          status: githubResponse.status,
          data: { displayName: githubResponse.data.login },
        }
      : {
          ok: false,
          status: githubResponse.status,
          error: githubResponse.error || 'Ошибка проверки GitHub токена',
        };
  }

  const repoConfig = REPOS[kind];

  if (repoConfig.kind !== 'gitlab') {
    return { ok: false, status: 0, error: 'Неверная конфигурация репозитория' };
  }

  const gitlabResponse = await checkGitlabToken(token, repoConfig.baseUrl);
  return gitlabResponse.ok && gitlabResponse.data
    ? {
        ok: true,
        status: gitlabResponse.status,
        data: { displayName: gitlabResponse.data.username },
      }
    : {
        ok: false,
        status: gitlabResponse.status,
        error: gitlabResponse.error || 'Ошибка проверки GitLab токена',
      };
};
