import { CustomSelectOptionInterface, FormItem, Select } from '@vkontakte/vkui';
import React, { JSX } from 'react';

import { ExportFormat } from '../../../types';

interface ExportFormatSelectProps {
  activeFormat: ExportFormat;
  handleChange: (exportFormat: ExportFormat) => void;
  options: CustomSelectOptionInterface[];
  disabled?: boolean;
}

export const ExportFormatSelect = ({
  activeFormat,
  handleChange,
  options,
  disabled,
}: ExportFormatSelectProps): JSX.Element => {
  return (
    <FormItem top="Тип экспорта" htmlFor="export-type-select-id" noPadding>
      <Select<ExportFormat>
        id="export-type-select-id"
        value={activeFormat}
        disabled={disabled}
        onChange={(_, newValue: ExportFormat) => handleChange(newValue)}
        options={options}
      />
    </FormItem>
  );
};
