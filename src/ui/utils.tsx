// src/ui/utils.tsx
import { Flex, Link } from '@vkontakte/vkui';
import { ReactNode } from 'react';

import { REPOS } from '../constants';
import { PluginToUIMessage, RepoKind } from '../types';

export const isPluginMessageEvent = (
  event: MessageEvent<unknown>
): event is MessageEvent<{ pluginMessage: PluginToUIMessage }> => {
  const data = event.data as Record<string, unknown> | null;
  return !!data && typeof data === 'object' && 'pluginMessage' in data;
};

export interface RepoOption {
  value: RepoKind;
  label: string;
  placeholder: string;
}

const generateStep = (content: string | ReactNode) => (
  <Flex.Item Component="li">{content}</Flex.Item>
);

export const renderTokenCreationGuide = (repo?: RepoKind): ReactNode => {
  if (!repo) return null;

  const { baseUrl } = REPOS[repo];

  switch (repo) {
    case 'public-icons':
      return (
        <Flex Component="ol" gap={8}>
          {generateStep(
            <>
              Перейдите в{' '}
              <Link
                href={`${baseUrl}/settings/tokens?type=pat`}
                target="_blank"
                rel="noopener noreferrer"
              >
                настройки GitHub → Developer settings → Personal access tokens
              </Link>
            </>
          )}
          {generateStep('Введите название токена (например, “Figma plugin”)')}
          {generateStep(
            <>
              Нажмите <b>“Generate new token (classic)”</b>
            </>
          )}
          {generateStep('Выберите срок действия (рекомендуется 90 дней или меньше)')}
          {generateStep(
            <>
              Включите доступ к <code>repo</code> (чтение и запись)
            </>
          )}
          {generateStep(<>Создайте токен и скопируйте его </>)}
          {generateStep(<>Готово. Вставьте его в поле!</>)}
        </Flex>
      );
    case 'internal-images':
    case 'private-icons':
      return (
        <Flex Component="ol" gap={8}>
          {generateStep(
            <>
              Перейдите в{' '}
              <Link
                href={`${baseUrl}/-/user_settings/personal_access_tokens`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Preferences → Access tokens
              </Link>
            </>
          )}
          {generateStep('Введите название токена (например, “Figma plugin”)')}
          {generateStep('Выберите срок действия (рекомендуется 90 дней или меньше)')}
          {generateStep(
            <>
              Выберите права: <code>api</code> и <code>write_repository</code>
            </>
          )}
          {generateStep(<>Создайте токен и скопируйте его</>)}
          {generateStep(<>Готово. Вставьте его в поле!</>)}
        </Flex>
      );
    default:
      return null;
  }
};
