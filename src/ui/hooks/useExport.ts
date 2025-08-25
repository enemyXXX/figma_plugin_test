import { ChipOption, CustomSelectOptionInterface } from '@vkontakte/vkui';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { EXPORT_FORMATS, RASTER_DENSITIES } from '../../constants';
import { ExportFormat, RasterDensity } from '../../types';
import { downloadZip } from '../../utils/download';
import { generateRequestId, postMessage } from '../../utils/message';
import { RepoOption } from '../utils';

import { useMessage } from './useMessage';

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

export const useExport = (activeRepoOption: RepoOption): UseExportReturn => {
  const rasterDensityOptions: ChipOption[] = useMemo(() => {
    return RASTER_DENSITIES.map((density) => ({ label: density.toUpperCase(), value: density }));
  }, []);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('svg');
  const [disableFormatSelect, setDisabledFormatSelect] = useState(true);
  const [densities, setDensities] = useState<ChipOption[]>(rasterDensityOptions);
  const [svgCurrentColor, setSvgCurrentColor] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastReqId, setLastReqId] = useState<string | null>(null);
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
    const reqId = generateRequestId();
    setProcessing(true);
    setLastReqId(reqId);

    postMessage({
      type: 'export',
      payload: {
        format: exportFormat,
        densities: densities.map((density) => density.value) as RasterDensity[],
        groupBySize: groupItems,
      },
      reqId,
    });
  }, [exportFormat, densities, groupItems]);

  const handleGroupItemsUpdate = useCallback(() => {
    setGroupItems((prev) => !prev);
  }, []);

  const resetProcess = () => {
    setLastReqId(null);
    setProcessing(false);
  };

  useMessage({ types: ['save-archive'] }, (message) => {
    switch (message.type) {
      case 'save-archive': {
        const { zipName, zipBytes } = message.payload;
        downloadZip(zipName, zipBytes);
        resetProcess();
        break;
      }
    }
  });

  useMessage(
    {
      types: ['error'],
      predicate: (message) =>
        message.type === 'error' &&
        message.target === 'export' &&
        (!lastReqId || message.reqId === lastReqId),
    },
    resetProcess
  );

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
