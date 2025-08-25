import { Flex, Spacing } from '@vkontakte/vkui';
import React, { JSX } from 'react';

import { useExport } from '../../hooks/useExport';
import { RepoOption } from '../../utils';

import { ExportActions } from './ExportActions';
import { ExportFormatSelect } from './ExportFormatSelect';
import { ExportRasterOptions } from './ExportRasterOptions';
import { ExportSharedOptions } from './ExportSharedOptions';
import { ExportSvgOptions } from './ExportSvgOptions';

interface ExportProps {
  activeRepoOption: RepoOption;
}
const Export = ({ activeRepoOption }: ExportProps): JSX.Element => {
  const {
    exportFormat,
    handleExportFormatChange,
    exportFormatOptions,
    densities,
    rasterDensityOptions,
    svgCurrentColor,
    handleDensitiesUpdate,
    handleZipDownload,
    processing,
    disableFormatSelect,
    groupItems,
    handleGroupItemsUpdate,
  } = useExport(activeRepoOption);

  const renderActiveExportFormatOptions = () => {
    switch (exportFormat) {
      case 'jpg':
      case 'png':
        return (
          <ExportRasterOptions
            value={densities}
            options={rasterDensityOptions}
            handleSelect={handleDensitiesUpdate}
          />
        );
      case 'svg':
        return <ExportSvgOptions currentColor={svgCurrentColor} />;
    }
  };

  return (
    <Flex direction="column" gap={8}>
      <ExportFormatSelect
        activeFormat={exportFormat}
        handleChange={handleExportFormatChange}
        options={exportFormatOptions}
        disabled={disableFormatSelect}
      />
      {renderActiveExportFormatOptions()}
      <ExportSharedOptions
        exportFormat={exportFormat}
        groupItems={groupItems}
        handleGroupItemsChange={handleGroupItemsUpdate}
      />
      <Spacing size={12} />
      <ExportActions>
        <ExportActions.Action disabled={processing}>Создать Merge Request</ExportActions.Action>
        <ExportActions.Action disabled={processing} onClick={handleZipDownload} mode="secondary">
          Скачать ZIP Archive
        </ExportActions.Action>
      </ExportActions>
    </Flex>
  );
};

export default Export;
