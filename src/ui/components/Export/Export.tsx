import { Spacing } from '@vkontakte/vkui';
import React, { JSX } from 'react';

import { useExport } from '../../hooks/useExport';

import { ExportActions } from './ExportActions';
import { ExportFormatSelect } from './ExportFormatSelect';
import { ExportRasterOptions } from './ExportRasterOptions';
import { ExportSvgOptions } from './ExportSvgOptions';

interface ExportProps {
  selectedNodes: SceneNode[];
}
const Export = ({ selectedNodes }: ExportProps): JSX.Element => {
  const {
    exportFormat,
    handleExportFormatChange,
    exportFormatOptions,
    densities,
    rasterDensityOptions,
    svgCurrentColor,
    handleDensitiesUpdate,
    disableActions,
  } = useExport(selectedNodes);

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
    <>
      <ExportFormatSelect
        activeFormat={exportFormat}
        handleChange={handleExportFormatChange}
        options={exportFormatOptions}
      />
      {renderActiveExportFormatOptions()}
      <Spacing size={24} />
      <ExportActions>
        <ExportActions.Action disabled={disableActions}>Создать Merge Request</ExportActions.Action>
        <ExportActions.Action disabled={disableActions} mode="secondary">
          Скачать ZIP Archive
        </ExportActions.Action>
      </ExportActions>
    </>
  );
};

export default Export;
