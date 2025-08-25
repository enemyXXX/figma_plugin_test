export type RepoKind = 'public-icons' | 'private-icons' | 'internal-images';

export type UIToPluginMessage =
  | { type: 'set-selected'; payload: { kind: RepoKind } }
  | { type: 'save-token'; payload: { kind: RepoKind; token: string } }
  | { type: 'clear-token'; payload: { kind: RepoKind } }
  | { type: 'check-token'; payload: { kind: RepoKind } }
  | {
      type: 'export-images';
      payload: {
        format: ExportFormat;
        densities?: RasterDensity[];
      };
    };

export type PluginToUIMessage =
  | { type: 'init'; payload: { selected: RepoKind; tokens: Record<RepoKind, string> } }
  | { type: 'selected-saved'; payload: { kind: RepoKind } }
  | { type: 'token-saved'; payload: { kind: RepoKind; token: string } }
  | { type: 'token-cleared'; payload: { kind: RepoKind } }
  | { type: 'token-ok'; payload: { kind: RepoKind; login: string } }
  | { type: 'token-error'; message: string }
  | { type: 'error'; message: string }
  | { type: 'selection'; payload: SceneNode[] }
  | { type: 'export-final' }
  | {
      type: 'export-result';
      payload: { zipName: string; zipBytes: Uint8Array<ArrayBuffer> };
    };

export type ActionStatus = {
  type: 'success' | 'fail';
  message: string;
};

export type RasterDensity = 'mdpi' | 'hdpi' | 'xhdpi' | 'xxhdpi' | 'xxxhdpi';

export type ExportFormat = 'png' | 'jpg' | 'svg';
