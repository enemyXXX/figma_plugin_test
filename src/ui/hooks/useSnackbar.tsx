import { Icon28CheckCircleOutline, Icon28ErrorCircleOutline } from '@vkontakte/icons';
import { Snackbar, SnackbarProps } from '@vkontakte/vkui';
import React, { ReactElement, useEffect, useState } from 'react';

import { ActionStatus } from '../../types';
import { isPluginMessageEvent } from '../utils';

export const useSnackbar = (): ReactElement<SnackbarProps> | null => {
  const [snackbar, setSnackbar] = useState<ReactElement<SnackbarProps> | null>(null);
  const [action, setAction] = useState<ActionStatus | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent<unknown>): void => {
      if (!isPluginMessageEvent(event)) return;

      const message = event.data.pluginMessage;

      switch (message.type) {
        case 'token-saved': {
          setAction({ type: 'success', message: 'Токен сохранен для выбранного репозитория' });
          break;
        }
        case 'token-cleared': {
          setAction({ type: 'success', message: 'Токен удалён для выбранного репозитория' });
          break;
        }
        case 'token-ok': {
          setAction({
            type: 'success',
            message: 'Токен валиден (' + String(message.payload.login) + ')',
          });
          break;
        }
        case 'token-error':
          console.log(message);
          setAction({
            type: 'fail',
            message: 'Ошибка при валидации токена: ' + String(message.message),
          });
          break;
        case 'error': {
          setAction({ type: 'fail', message: 'Ошибка: ' + String(message.message) });
          break;
        }
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (!action) return;

    setSnackbar(null);

    const icon =
      action.type === 'success' ? (
        <Icon28CheckCircleOutline fill="var(--vkui--color_icon_positive)" />
      ) : (
        <Icon28ErrorCircleOutline fill="var(--vkui--color_icon_negative)" />
      );

    setTimeout(() => {
      setSnackbar(
        <Snackbar onClose={() => setSnackbar(null)} before={icon}>
          {action.message}
        </Snackbar>
      );
    }, 200);
  }, [action]);

  return snackbar;
};
