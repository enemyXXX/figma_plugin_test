import { CustomSelectOptionInterface, FormItem, Select } from '@vkontakte/vkui';
import React, { JSX } from 'react';

import { ExportFormat } from '../../../types';

interface ExportFormatSelectProps {
  activeFormat: ExportFormat;
  handleChange: (exportFormat: ExportFormat) => void;
  options: CustomSelectOptionInterface[];
}

export const ExportFormatSelect = ({
  activeFormat,
  handleChange,
  options,
}: ExportFormatSelectProps): JSX.Element => {
  return (
    <FormItem top="Тип экспорта" htmlFor="export-type-select-id">
      <Select<ExportFormat>
        id="export-type-select-id"
        value={activeFormat}
        onChange={(_, newValue: ExportFormat) => handleChange(newValue)}
        options={options}
      />
    </FormItem>
  );
};
