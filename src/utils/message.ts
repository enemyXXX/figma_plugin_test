import type { UIToPluginMessage } from '../types';

export const hasMessage = (x: unknown): x is { message: unknown } => {
  return typeof x === 'object' && x !== null && 'message' in x;
};
export const toMessage = (event: unknown): string => {
  if (hasMessage(event)) return String(event.message);

  return String(event);
};

export const postMessage = (message: UIToPluginMessage) => {
  window.parent.postMessage({ pluginMessage: message }, '*');
};

export const generateRequestId = (): string => {
  return String(Date.now()) + '-' + String(Math.random()).slice(2);
};
