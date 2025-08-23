import { Button, ButtonGroup, ButtonProps } from '@vkontakte/vkui';
import React, { JSX, ReactElement } from 'react';

interface ExportActionsComponentProps {
  children: ReactElement<ButtonProps>;
}

const ExportActionsComponent = ({ children }: ExportActionsComponentProps): JSX.Element => {
  return <ButtonGroup gap="s">{children}</ButtonGroup>;
};

const ExportAction = ({ size = 'm', ...restProps }: ButtonProps): JSX.Element => {
  return <Button size={size} {...restProps} />;
};

export const ExportActions = Object.assign(ExportActionsComponent, {
  Action: ExportAction,
});
