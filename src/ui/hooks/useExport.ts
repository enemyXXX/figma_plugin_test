import { ChipOption, CustomSelectOptionInterface } from '@vkontakte/vkui';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { EXPORT_FORMATS, RASTER_DENSITIES } from '../../constants';
import { ExportFormat, RasterDensity } from '../../types';
import { downloadZip } from '../../utils/download';
import { postMessage } from '../../utils/message';
import { isPluginMessageEvent, RepoOption } from '../utils';

interface UseExportProps {
  selectedNodes: SceneNode[];
  activeRepoOption: RepoOption;
}

interface UseExportReturn {
  exportFormat: ExportFormat;
  handleExportFormatChange: (exportFormat: ExportFormat) => void;
  exportFormatOptions: CustomSelectOptionInterface[];
  rasterDensityOptions: ChipOption[];
  densities: ChipOption[];
  handleDensitiesUpdate: (value: ChipOption[]) => void;
  svgCurrentColor: boolean;
  handleZipDownload: VoidFunction;
  processing: boolean;
  disableFormatSelect: boolean;
  groupItems: boolean;
  handleGroupItemsUpdate: VoidFunction;
}

export const useExport = ({ selectedNodes, activeRepoOption }: UseExportProps): UseExportReturn => {
  const rasterDensityOptions: ChipOption[] = useMemo(() => {
    return RASTER_DENSITIES.map((density) => ({ label: density.toUpperCase(), value: density }));
  }, []);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('svg');
  const [disableFormatSelect, setDisabledFormatSelect] = useState(true);
  const [densities, setDensities] = useState<ChipOption[]>(rasterDensityOptions);
  const [svgCurrentColor, setSvgCurrentColor] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [groupItems, setGroupItems] = useState(true);

  useEffect(() => {
    const isPublicRepo = activeRepoOption.value === 'public-icons';

    if (isPublicRepo) {
      setExportFormat('svg');
    }

    setDisabledFormatSelect(isPublicRepo);
  }, [activeRepoOption]);

  const handleExportFormatChange = useCallback((exportFormat: ExportFormat) => {
    setExportFormat(exportFormat);
  }, []);

  const exportFormatOptions: CustomSelectOptionInterface[] = useMemo(() => {
    return EXPORT_FORMATS.map((exportFormat) => ({
      label: exportFormat.toUpperCase(),
      value: exportFormat,
    }));
  }, []);

  const handleZipDownload = useCallback(() => {
    setProcessing(true);

    postMessage({
      type: 'export-images',
      payload: {
        format: exportFormat,
        densities: densities.map((density) => density.value) as RasterDensity[],
      },
    });
  }, [exportFormat, densities]);

  const handleGroupItemsUpdate = useCallback(() => {
    setGroupItems((prev) => !prev);
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent<unknown>): void => {
      if (!isPluginMessageEvent(event)) return;
      const message = event.data.pluginMessage;

      switch (message.type) {
        case 'export-final':
          setProcessing(false);
          break;
        case 'export-result': {
          const { zipName, zipBytes } = message.payload;
          downloadZip(zipName, zipBytes);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return {
    exportFormat,
    handleExportFormatChange,
    exportFormatOptions,
    rasterDensityOptions,
    densities,
    svgCurrentColor,
    handleDensitiesUpdate: setDensities,
    handleZipDownload,
    processing,
    disableFormatSelect,
    groupItems,
    handleGroupItemsUpdate,
  };
};
