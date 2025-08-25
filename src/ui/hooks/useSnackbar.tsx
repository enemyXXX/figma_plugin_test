import { Icon28CheckCircleOutline, Icon28ErrorCircleOutline } from '@vkontakte/icons';
import { Snackbar, SnackbarProps } from '@vkontakte/vkui';
import React, { ReactElement, useEffect, useState } from 'react';

import { ActionStatus } from '../../types';

import { useMessage } from './useMessage';

export const useSnackbar = (): ReactElement<SnackbarProps> | null => {
  const [snackbar, setSnackbar] = useState<ReactElement<SnackbarProps> | null>(null);
  const [action, setAction] = useState<ActionStatus | null>(null);

  useMessage(
    { types: ['token-saved', 'token-cleared', 'token-valid', 'save-archive', 'error'] },
    (message) => {
      switch (message.type) {
        case 'token-saved':
          setAction({ type: 'success', message: 'Токен сохранён для выбранного репозитория' });
          break;
        case 'token-cleared':
          setAction({ type: 'success', message: 'Токен удалён для выбранного репозитория' });
          break;
        case 'token-valid':
          setAction({
            type: 'success',
            message: 'Токен валиден (' + String(message.payload.login) + ')',
          });
          break;
        case 'save-archive':
          setAction({ type: 'success', message: 'Zip-архив успешно создан' });
          break;
        case 'error':
          setAction({ type: 'fail', message: 'Ошибка: ' + String(message.message) });
          break;
      }
    }
  );

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
