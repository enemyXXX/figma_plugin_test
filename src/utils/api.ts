import { REPOS } from '../constants';
import { RepoKind } from '../types';

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

function hasMessage(x: unknown): x is { message: unknown } {
  return typeof x === 'object' && x !== null && 'message' in x;
}

function toApiError(e: unknown): string {
  if (hasMessage(e)) return String(e.message);
  return String(e);
}

/**
 * Безопасный fetch с таймаутом.
 */
export async function safeFetch(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (controller) {
    init = Object.assign({}, init, { signal: controller.signal });
  }

  try {
    const request = fetch(url, init);

    const timeout = new Promise<Response>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller?.abort();
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
}

/**
 * Проверка GitHub токена.
 */
export async function checkGithubToken(
  token: string
): Promise<ApiResult<{ login: string; id?: number }>> {
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
}

/**
 * Проверка GitLab токена.
 */
export async function checkGitlabToken(
  token: string,
  baseUrl: string
): Promise<ApiResult<{ username: string; id?: number }>> {
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
}

/**
 * Унифицированная проверка токена по RepoKind.
 */
export async function verifyTokenByKind(
  kind: RepoKind,
  token: string
): Promise<ApiResult<{ displayName: string }>> {
  if (!token) return { ok: false, status: 0, error: 'Токен не задан' };

  if (kind === 'public-icons') {
    const gh = await checkGithubToken(token);
    return gh.ok && gh.data
      ? { ok: true, status: gh.status, data: { displayName: gh.data.login } }
      : { ok: false, status: gh.status, error: gh.error || 'Ошибка проверки GitHub токена' };
  }

  const cfg = REPOS[kind];
  if (cfg.kind !== 'gitlab') {
    return { ok: false, status: 0, error: 'Неверная конфигурация репозитория' };
  }

  const gl = await checkGitlabToken(token, cfg.baseUrl);
  return gl.ok && gl.data
    ? { ok: true, status: gl.status, data: { displayName: gl.data.username } }
    : { ok: false, status: gl.status, error: gl.error || 'Ошибка проверки GitLab токена' };
}
