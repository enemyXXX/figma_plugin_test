import { ExportFormat, RasterDensity, RepoKind } from './types';
import { RepoOption } from './ui/utils';

export const STORAGE_KEYS = {
  selected: 'repo_selected',
  tokenPublic: 'token_public_icons', // GitHub PAT
  tokenPrivate: 'token_private_icons', // GitLab token
  tokenImages: 'token_internal_images', // GitLab token
};

export const REPOS: Record<
  RepoKind,
  | { kind: 'github'; apiBase: string; baseUrl: string; owner: string; repo: string }
  | { kind: 'gitlab'; baseUrl: string; projectPath: string }
> = {
  'public-icons': {
    kind: 'github',
    baseUrl: 'https://github.com',
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

export const INITIAL_TOKENS_STATE: Record<RepoKind, string> = {
  'public-icons': '',
  'private-icons': '',
  'internal-images': '',
};

export const RASTER_DENSITIES: ReadonlyArray<RasterDensity> = [
  'mdpi',
  'hdpi',
  'xhdpi',
  'xxhdpi',
  'xxxhdpi',
];

export const RASTER_SCALE: Record<RasterDensity, number> = {
  mdpi: 1.0,
  hdpi: 1.5,
  xhdpi: 2.0,
  xxhdpi: 3.0,
  xxxhdpi: 4.0,
};

export const RASTER_FOLDER: Record<RasterDensity, string> = {
  mdpi: 'drawable-mdpi',
  hdpi: 'drawable-hdpi',
  xhdpi: 'drawable-xhdpi',
  xxhdpi: 'drawable-xxhdpi',
  xxxhdpi: 'drawable-xxxhdpi',
};

export const EXPORT_FORMATS: ReadonlyArray<ExportFormat> = ['svg', 'png', 'jpg'];
