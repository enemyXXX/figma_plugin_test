import './utils/polyfills';
import JSZip from 'jszip';

import { RASTER_SCALE } from './constants';
import {
  ExportFormat,
  PluginToUIMessage,
  RasterDensity,
  RepoKind,
  UIToPluginMessage,
} from './types';
import { verifyTokenByKind } from './utils/api';
import { exportNodeBytes, getNodeBaseSize, rasterPath, svgPath } from './utils/export';
import { toMessage } from './utils/message';
import { Storage } from './utils/storage';

figma.showUI(__html__, { width: 620, height: 520 });

const postMessage = (message: PluginToUIMessage): void => {
  figma.ui.postMessage(message);
};

const isRepoKind = (x: unknown): x is RepoKind => {
  return x === 'public-icons' || x === 'private-icons' || x === 'internal-images';
};

const computeSelectionCount = (): number => {
  return figma.currentPage.selection.length;
};

const emitSelection = (): void => {
  figma.ui.postMessage({ type: 'selection', payload: { total: computeSelectionCount() } });
};

const exportSelection = async (
  format: ExportFormat,
  densities: ReadonlyArray<RasterDensity>,
  groupBySize: boolean
): Promise<{ zipName: string; zipBytes: Uint8Array<ArrayBuffer> }> => {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    throw new Error('Ни один элемент не выделен');
  }

  const zip = new JSZip();

  for (const node of selection) {
    const baseSize = getNodeBaseSize(node);

    if (format === 'svg') {
      const svgBytes = await exportNodeBytes(node, {
        format: 'SVG',
        useAbsoluteBounds: true,
        svgOutlineText: true,
        svgIdAttribute: true,
        svgSimplifyStroke: false,
      });

      zip.file(
        svgPath({
          nodeName: node.name,
          groupBySize,
          baseSize,
        }),
        svgBytes
      );
      continue;
    }

    for (const density of densities) {
      const scale = RASTER_SCALE[density];

      const bytes = await exportNodeBytes(node, {
        format: format.toUpperCase() as ExportSettingsImage['format'],
        useAbsoluteBounds: true,
        constraint: { type: 'SCALE', value: scale },
      });

      zip.file(
        rasterPath({
          nodeName: node.name,
          density,
          exportFormat: format,
          groupBySize,
          baseSize,
        }),
        bytes
      );
    }
  }

  const zipBytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  return { zipName: 'images_export.zip', zipBytes };
};

(async function bootstrap() {
  try {
    const selected = (await Storage.getRepoKind()) || 'public-icons';
    const tokens = await Storage.getAllTokens();
    postMessage({ type: 'init', payload: { selected, tokens } });
    emitSelection();
  } catch (e) {
    postMessage({ type: 'error', message: toMessage(e) });
  }
})();

figma.on('selectionchange', emitSelection);

figma.ui.onmessage = async function (message: UIToPluginMessage): Promise<void> {
  try {
    switch (message.type) {
      case 'set-selected': {
        const kind = isRepoKind(message.payload.kind) ? message.payload.kind : 'public-icons';
        await Storage.setRepoKind(kind);
        postMessage({ type: 'selected-saved', payload: { kind } });
        break;
      }

      case 'save-token': {
        const kind = isRepoKind(message.payload.kind) ? message.payload.kind : 'public-icons';
        const token = message.payload.token;

        if (kind === 'public-icons' && !/^ghp_|^github_pat_/.test(token)) {
          postMessage({ type: 'error', message: 'Ожидается GitHub PAT (ghp_… или github_pat_…)' });
          return;
        }

        await Storage.setToken(kind, token);
        postMessage({ type: 'token-saved', payload: { kind, token } });
        break;
      }

      case 'clear-token': {
        const kind = isRepoKind(message.payload.kind) ? message.payload.kind : 'public-icons';
        await Storage.clearToken(kind);
        postMessage({ type: 'token-cleared', payload: { kind } });
        break;
      }

      case 'check-token': {
        const kind = isRepoKind(message.payload.kind) ? message.payload.kind : 'public-icons';
        const tokenValue = (await Storage.getToken(kind)) || '';
        const reqId = message.reqId;

        if (!tokenValue) {
          postMessage({ type: 'error', message: 'Токен не задан' });
          return;
        }

        const result = await verifyTokenByKind(kind, tokenValue);

        if (result.ok && result.data) {
          postMessage({
            type: 'token-valid',
            payload: { kind, login: result.data.displayName },
            reqId,
          });
        } else {
          postMessage({
            type: 'error',
            message:
              (result.error || 'Проверка не пройдена') +
              (result.status ? ' (' + String(result.status) + ')' : ''),
            target: message.type,
            reqId,
          });
        }

        break;
      }

      case 'export': {
        const format = message.payload.format;
        const densities: RasterDensity[] = message.payload.densities || [];
        const reqId = message.reqId;
        const groupBySize = !!message.payload.groupBySize;

        if ((format === 'png' || format === 'jpg') && densities.length === 0) {
          postMessage({ type: 'error', message: 'Не выбраны плотности' });
          break;
        }

        try {
          const response = await exportSelection(format, densities, groupBySize);
          postMessage({
            type: 'save-archive',
            payload: { zipName: response.zipName, zipBytes: response.zipBytes },
          });
        } catch (error) {
          postMessage({ type: 'error', message: toMessage(error), target: message.type, reqId });
        }
        break;
      }
    }
  } catch (error) {
    postMessage({ type: 'error', message: toMessage(error) });
  }
};
