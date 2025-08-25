import { STORAGE_KEYS } from '../constants';
import { RepoKind } from '../types';

type TokenMap = {
  'public-icons': typeof STORAGE_KEYS.tokenPublic;
  'private-icons': typeof STORAGE_KEYS.tokenPrivate;
  'internal-images': typeof STORAGE_KEYS.tokenImages;
};

const tokenKeyByRepo: TokenMap = {
  'public-icons': STORAGE_KEYS.tokenPublic,
  'private-icons': STORAGE_KEYS.tokenPrivate,
  'internal-images': STORAGE_KEYS.tokenImages,
};

export const Storage = {
  async getRepoKind(): Promise<RepoKind | null> {
    return (await figma.clientStorage.getAsync(STORAGE_KEYS.selected)) as RepoKind | null;
  },

  async setRepoKind(kind: RepoKind): Promise<void> {
    await figma.clientStorage.setAsync(STORAGE_KEYS.selected, kind);
  },

  async getToken(kind: RepoKind): Promise<string | null> {
    const key = tokenKeyByRepo[kind];

    return (await figma.clientStorage.getAsync(key)) as string | null;
  },

  async setToken(kind: RepoKind, token: string): Promise<void> {
    const key = tokenKeyByRepo[kind];
    await figma.clientStorage.setAsync(key, token);
  },

  async clearToken(kind: RepoKind): Promise<void> {
    const key = tokenKeyByRepo[kind];
    await figma.clientStorage.deleteAsync(key);
  },

  async getAllTokens(): Promise<Record<RepoKind, string>> {
    const [publicToken, privateIconsToken, imagesToken] = await Promise.all([
      figma.clientStorage.getAsync(STORAGE_KEYS.tokenPublic),
      figma.clientStorage.getAsync(STORAGE_KEYS.tokenPrivate),
      figma.clientStorage.getAsync(STORAGE_KEYS.tokenImages),
    ]);

    return {
      'public-icons': (publicToken as string) || '',
      'private-icons': (privateIconsToken as string) || '',
      'internal-images': (imagesToken as string) || '',
    };
  },
};
