import { Icon16Help } from '@vkontakte/icons';
import { Flex, Subhead, Tooltip } from '@vkontakte/vkui';
import React, { JSX } from 'react';

interface SelectionInfoProps {
  count: number;
}

export const SelectionInfo = ({ count }: SelectionInfoProps): JSX.Element => {
  return (
    <Subhead>
      <Flex gap={8} align="center">
        Выбрано элементов: {count}
        <Tooltip description="Можно изменять выделенные элементы когда плагин открыт">
          <Icon16Help />
        </Tooltip>
      </Flex>
    </Subhead>
  );
};
