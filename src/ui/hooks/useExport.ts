import { ChipOption, CustomSelectOptionInterface } from '@vkontakte/vkui';
import { useCallback, useMemo, useState } from 'react';

import { EXPORT_FORMATS, RASTER_DENSITIES } from '../../constants';
import { ExportFormat } from '../../types';

interface UseExportReturn {
  exportFormat: ExportFormat;
  handleExportFormatChange: (exportFormat: ExportFormat) => void;
  exportFormatOptions: CustomSelectOptionInterface[];
  rasterDensityOptions: ChipOption[];
  densities: ChipOption[];
  handleDensitiesUpdate: (value: ChipOption[]) => void;
  svgCurrentColor: boolean;
  disableActions: boolean;
}

export const useExport = (selectedNodes: SceneNode[]): UseExportReturn => {
  const rasterDensityOptions: ChipOption[] = useMemo(() => {
    return RASTER_DENSITIES.map((density) => ({ label: density.toUpperCase(), value: density }));
  }, []);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('svg');
  const [densities, setDensities] = useState<ChipOption[]>(rasterDensityOptions);
  const [svgCurrentColor, setSvgCurrentColor] = useState(false);

  const handleExportFormatChange = useCallback((exportFormat: ExportFormat) => {
    setExportFormat(exportFormat);
  }, []);

  const exportFormatOptions: CustomSelectOptionInterface[] = useMemo(() => {
    return EXPORT_FORMATS.map((exportFormat) => ({
      label: exportFormat.toUpperCase(),
      value: exportFormat,
    }));
  }, []);

  return {
    exportFormat,
    handleExportFormatChange,
    exportFormatOptions,
    rasterDensityOptions,
    densities,
    svgCurrentColor,
    handleDensitiesUpdate: setDensities,
    disableActions: !selectedNodes.length,
  };
};
