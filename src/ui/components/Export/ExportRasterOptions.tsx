import { ChipsSelect, ChipOption, FormItem } from '@vkontakte/vkui';
import React, { JSX } from 'react';

interface ExportRasterOptionsProps {
  value: ChipOption[];
  handleSelect: (value: ChipOption[]) => void;
  options: ChipOption[];
}

export const ExportRasterOptions = ({
  value,
  options,
  handleSelect,
}: ExportRasterOptionsProps): JSX.Element => {
  return (
    <FormItem top="Плотности" htmlFor="raster-density-select">
      <ChipsSelect
        value={value}
        options={options}
        placeholder="Ничего не выбрано"
        id="raster-density-select"
        emptyText="Ничего не найдено"
        allowClearButton
        clearButtonShown={!!value.length}
        closeAfterSelect={false}
        selectedBehavior="hide"
        onChange={handleSelect}
      />
    </FormItem>
  );
};
