import { RepoKind, UIToPluginMessage, PluginToUIMessage } from './types';
import { verifyTokenByKind } from './utils/api';
import { Storage } from './utils/storage';

figma.showUI(__html__, { width: 520, height: 420 });

function postMessage(msg: PluginToUIMessage): void {
  figma.ui.postMessage(msg);
}

function isRepoKind(v: unknown): v is RepoKind {
  return v === 'public-icons' || v === 'private-icons' || v === 'internal-images';
}

function hasMessage(x: unknown): x is { message: unknown } {
  return typeof x === 'object' && x !== null && 'message' in (x as Record<string, unknown>);
}
function toMessage(e: unknown): string {
  if (hasMessage(e)) return String(e.message);
  return String(e);
}

(async function bootstrap() {
  try {
    const selected = (await Storage.getRepoKind()) || 'public-icons';
    const tokens = await Storage.getAllTokens();
    postMessage({ type: 'init', payload: { selected, tokens } });
  } catch (e) {
    postMessage({ type: 'error', message: toMessage(e) });
  }
})();

figma.ui.onmessage = async function (msg: UIToPluginMessage): Promise<void> {
  try {
    switch (msg.type) {
      case 'set-selected': {
        const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : 'public-icons';
        await Storage.setRepoKind(kind);
        postMessage({ type: 'selected-saved', payload: { kind } });
        break;
      }

      case 'save-token': {
        const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : 'public-icons';
        const token = msg.payload.token;

        if (kind === 'public-icons' && !/^ghp_|^github_pat_/.test(token)) {
          postMessage({ type: 'error', message: 'Ожидается GitHub PAT (ghp_… или github_pat_…)' });
          return;
        }

        await Storage.setToken(kind, token);
        postMessage({ type: 'token-saved', payload: { kind } });
        break;
      }

      case 'clear-token': {
        const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : 'public-icons';
        await Storage.clearToken(kind);
        postMessage({ type: 'token-cleared', payload: { kind } });
        break;
      }

      case 'check-token': {
        const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : 'public-icons';
        const tokenValue = (await Storage.getToken(kind)) || '';
        if (!tokenValue) {
          postMessage({ type: 'error', message: 'Токен не задан' });
          return;
        }

        const result = await verifyTokenByKind(kind, tokenValue);
        if (result.ok && result.data) {
          postMessage({
            type: 'token-ok',
            payload: { kind, login: result.data.displayName },
          });
        } else {
          postMessage({
            type: 'error',
            message:
              (result.error || 'Проверка не пройдена') +
              (result.status ? ' (' + String(result.status) + ')' : ''),
          });
        }
        break;
      }
    }
  } catch (e) {
    postMessage({ type: 'error', message: toMessage(e) });
  }
};
