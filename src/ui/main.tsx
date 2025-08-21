import {
  AdaptivityProvider,
  AppRoot,
  Button,
  ButtonGroup,
  ConfigProvider,
  Div,
  FormItem,
  Group,
  Input,
  Select,
  Snackbar,
  SnackbarProps,
  Tooltip,
} from '@vkontakte/vkui';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@vkontakte/vkui/dist/vkui.css';

import { REPO_OPTIONS } from '../constants';
import type { RepoKind } from '../types';

import { useRepo } from './hooks/useRepo';
import { renderTokenCreationGuide, RepoOption } from './utils';

import { Icon24Help, Icon28CheckCircleOutline, Icon28ErrorCircleOutline } from '@vkontakte/icons';

function App(): JSX.Element {
  const { repo, updateRepo, token, updateToken, status, saveToken, checkToken, clearToken } =
    useRepo();
  const [snackbar, setSnackbar] = useState<ReactElement<SnackbarProps> | null>(null);

  useEffect(() => {
    if (!status) return;

    setSnackbar(null);

    const icon =
      status.type === 'success' ? (
        <Icon28CheckCircleOutline fill="var(--vkui--color_icon_positive)" />
      ) : (
        <Icon28ErrorCircleOutline fill="var(--vkui--color_icon_negative)" />
      );

    setTimeout(() => {
      setSnackbar(
        <Snackbar onClose={() => setSnackbar(null)} before={icon}>
          {status.message}
        </Snackbar>
      );
    }, 200);
  }, [status]);

  const selectedRepoOption: RepoOption | undefined = useMemo(() => {
    return REPO_OPTIONS.find((o) => o.value === repo);
  }, [repo]);

  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <Group>
            <Div>
              <FormItem top="Репозиторий">
                <Select<RepoKind>
                  value={repo}
                  options={REPO_OPTIONS}
                  onChange={(_, newValue: RepoKind) => {
                    updateRepo(newValue);
                  }}
                />
              </FormItem>

              <FormItem
                top={
                  <FormItem.Top>
                    <FormItem.TopLabel>Токен доступа</FormItem.TopLabel>
                    <FormItem.TopAside>
                      <Tooltip
                        placement="auto"
                        title="Как сгенерировать токен?"
                        appearance="accent"
                        description={renderTokenCreationGuide(repo)}
                      >
                        <Icon24Help />
                      </Tooltip>
                    </FormItem.TopAside>
                  </FormItem.Top>
                }
              >
                <Input
                  type="password"
                  placeholder={selectedRepoOption?.placeholder}
                  required
                  value={token}
                  onChange={(e) => updateToken((e.target as HTMLInputElement).value)}
                />
              </FormItem>

              <ButtonGroup gap="s">
                <Button disabled={!token} size="m" onClick={saveToken}>
                  Сохранить токен
                </Button>
                <Button disabled={!token} size="m" mode="secondary" onClick={clearToken}>
                  Удалить токен
                </Button>
                <Button disabled={!token} size="m" mode="tertiary" onClick={checkToken}>
                  Проверить токен
                </Button>
              </ButtonGroup>
              {snackbar}
            </Div>
          </Group>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
