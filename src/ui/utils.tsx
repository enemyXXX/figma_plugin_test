// src/ui/utils.tsx
import { Subhead } from '@vkontakte/vkui';
import { ReactNode } from 'react';

import { RepoKind } from '../types';

export interface RepoOption {
  value: RepoKind;
  label: string;
  placeholder: string;
}

export const renderTokenCreationGuide = (repo: RepoKind): ReactNode => {
  switch (repo) {
    case 'public-icons':
      return <Subhead>github</Subhead>;
    case 'internal-images':
    case 'private-icons':
      return <Subhead>gitlab</Subhead>;
    default:
      return null;
  }
};
