export type RepoKind = 'public-icons' | 'private-icons' | 'internal-images';

export type UIToPluginMessage =
  | { type: 'set-selected'; payload: { kind: RepoKind } }
  | { type: 'save-token'; payload: { kind: RepoKind; token: string } }
  | { type: 'clear-token'; payload: { kind: RepoKind } }
  | { type: 'check-token'; payload: { kind: RepoKind } };

export type PluginToUIMessage =
  | { type: 'init'; payload: { selected: RepoKind; tokens: Record<RepoKind, string> } }
  | { type: 'selected-saved'; payload: { kind: RepoKind } }
  | { type: 'token-saved'; payload: { kind: RepoKind } }
  | { type: 'token-cleared'; payload: { kind: RepoKind } }
  | { type: 'token-ok'; payload: { kind: RepoKind; login: string } }
  | { type: 'error'; message: string };

export type ActionStatus = {
  type: 'success' | 'fail';
  message: string;
};
