import { Icon24Help } from '@vkontakte/icons';
import { Accordion, Button, ButtonGroup, FormItem, Input, Select, Tooltip } from '@vkontakte/vkui';
import React from 'react';

import { REPO_OPTIONS } from '../../../constants';
import type { RepoKind } from '../../../types';
import { useAuth } from '../../hooks/useAuth';
import { renderTokenCreationGuide, RepoOption } from '../../utils';

interface AuthProps {
  activeRepoOption: RepoOption;
}

export const Auth = ({ activeRepoOption }: AuthProps) => {
  const {
    updateRepo,
    token,
    updateToken,
    savedToken,
    tokenVerification,
    saveToken,
    checkToken,
    clearToken,
    isTokenSaved,
  } = useAuth(activeRepoOption.value);

  return (
    <Accordion>
      <Accordion.Summary iconPosition="before">
        <Select<RepoKind>
          value={activeRepoOption.value}
          options={REPO_OPTIONS}
          onChange={(_, newValue: RepoKind) => {
            updateRepo(newValue);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </Accordion.Summary>
      <Accordion.Content>
        <FormItem
          top={
            <FormItem.Top>
              <FormItem.TopLabel>Токен доступа</FormItem.TopLabel>
              <FormItem.TopAside>
                <Tooltip
                  placement="auto"
                  title="Как сгенерировать токен?"
                  appearance="neutral"
                  enableInteractive
                  maxWidth={300}
                  description={renderTokenCreationGuide(activeRepoOption.value)}
                >
                  <Icon24Help />
                </Tooltip>
              </FormItem.TopAside>
            </FormItem.Top>
          }
        >
          <Input
            type="password"
            placeholder={activeRepoOption.placeholder}
            required
            value={token}
            onChange={(e) => updateToken((e.target as HTMLInputElement).value)}
          />
        </FormItem>

        <ButtonGroup gap="s">
          <Button disabled={!token || isTokenSaved} size="m" onClick={saveToken}>
            Сохранить токен
          </Button>
          <Button disabled={!savedToken} size="m" mode="secondary" onClick={clearToken}>
            Удалить токен
          </Button>
          <Button
            loading={tokenVerification}
            disabled={!token || tokenVerification || !isTokenSaved}
            size="m"
            mode="tertiary"
            onClick={checkToken}
          >
            Проверить токен
          </Button>
        </ButtonGroup>
      </Accordion.Content>
    </Accordion>
  );
};
