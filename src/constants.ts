import { RepoKind } from './types';
import { RepoOption } from './ui/utils';

export const STORAGE_KEYS = {
  selected: 'repo_selected', // RepoKind
  tokenPublic: 'token_public_icons', // GitHub PAT
  tokenPrivate: 'token_private_icons', // GitLab token
  tokenImages: 'token_internal_images', // GitLab token
};

/**
 * Базовая конфигурация «куда» ходим для каждого вида репозитория.
 */
export const REPOS: Record<
  RepoKind,
  | { kind: 'github'; apiBase: string; owner: string; repo: string }
  | { kind: 'gitlab'; baseUrl: string; projectPath: string }
> = {
  'public-icons': {
    kind: 'github',
    apiBase: 'https://api.github.com',
    owner: 'VKCOM',
    repo: 'icons',
  },
  'private-icons': {
    kind: 'gitlab',
    baseUrl: 'https://gitlab.mvk.com',
    projectPath: 'design/icons-private',
  },
  'internal-images': {
    kind: 'gitlab',
    baseUrl: 'https://gitlab.mvk.com',
    projectPath: 'design/images',
  },
};

export const REPO_OPTIONS: RepoOption[] = [
  {
    value: 'public-icons',
    label: 'Публичные иконки (GitHub VKCOM/icons)',
    placeholder: 'github_pat_… или ghp_…',
  },
  {
    value: 'private-icons',
    label: 'Приватные иконки (GitLab icons-private)',
    placeholder: 'GitLab Private-Token',
  },
  {
    value: 'internal-images',
    label: 'Внутренние изображения (GitLab images)',
    placeholder: 'GitLab Private-Token',
  },
];
