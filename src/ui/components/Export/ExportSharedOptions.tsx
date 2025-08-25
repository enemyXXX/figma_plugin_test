import { Checkbox, FormItem } from '@vkontakte/vkui';
import React from 'react';

import { ExportFormat } from '../../../types';

interface ExportSharedOptionsProps {
  exportFormat: ExportFormat;
  groupItems: boolean;
  handleGroupItemsChange: VoidFunction;
}
export const ExportSharedOptions = ({
  exportFormat,
  groupItems,
  handleGroupItemsChange,
}: ExportSharedOptionsProps) => {
  const iconName = `icon_20_add.${exportFormat}`;
  const path = `src/${exportFormat}/20/${exportFormat === 'svg' ? '' : 'drawable-*/'}${iconName}`;
  const unsortedPath = `src/${exportFormat}/Unsorted/${exportFormat === 'svg' ? '' : 'drawable-*/'}${iconName}`;

  return (
    <FormItem noPadding>
      <Checkbox
        checked={groupItems}
        onChange={handleGroupItemsChange}
        description={`${iconName} будет добавлен по пути ${path}, иначе — ${unsortedPath}`}
      >
        Группировать по папкам в соотвествии с размером
      </Checkbox>
    </FormItem>
  );
};
