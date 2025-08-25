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
import { exportNodeBytes, rasterPath, svgPath } from './utils/export';
import { toMessage } from './utils/message';
import { Storage } from './utils/storage';

figma.showUI(__html__, { width: 620, height: 520 });

const postMessage = (message: PluginToUIMessage): void => {
  figma.ui.postMessage(message);
};

const isRepoKind = (x: unknown): x is RepoKind => {
  return x === 'public-icons' || x === 'private-icons' || x === 'internal-images';
};

const computeSelectionCount = (): SceneNode[] => {
  return figma.currentPage.selection;
};

const emitSelection = (): void => {
  figma.ui.postMessage({ type: 'selection', payload: computeSelectionCount() });
};

const exportSelection = async (
  format: ExportFormat,
  densities: ReadonlyArray<RasterDensity>
): Promise<{ zipName: string; zipBytes: Uint8Array<ArrayBuffer> }> => {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    postMessage({ type: 'error', message: 'Ни один элемент не выделен' });
  }

  const zip = new JSZip();

  for (const node of selection) {
    const nodeName = node.name || 'asset_' + String(i + 1);

    if (format === 'svg') {
      const svgBytes = await exportNodeBytes(node, {
        format: 'SVG',
        useAbsoluteBounds: true,
        svgOutlineText: true,
        svgIdAttribute: true,
        svgSimplifyStroke: false,
      });

      zip.file(svgPath(nodeName), svgBytes);
      continue;
    }

    for (const density of densities) {
      const scale = RASTER_SCALE[density];

      const bytes = await exportNodeBytes(node, {
        format: format.toUpperCase() as ExportSettingsImage['format'],
        useAbsoluteBounds: true,
        constraint: { type: 'SCALE', value: scale },
      });

      zip.file(rasterPath(nodeName, density, format), bytes);
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
        if (!tokenValue) {
          postMessage({ type: 'error', message: 'Токен не задан' });
          return;
        }

        const result = await verifyTokenByKind(kind, tokenValue);

        if (result.ok && result.data) {
          postMessage({
            type: 'token-ok',
            payload: { kind, login: result.data.displayName },
          });
        } else {
          postMessage({
            type: 'token-error',
            message:
              (result.error || 'Проверка не пройдена') +
              (result.status ? ' (' + String(result.status) + ')' : ''),
          });
        }
        break;
      }

      case 'export-images': {
        const format = message.payload.format;
        const densities: RasterDensity[] = message.payload.densities || [];

        if ((format === 'png' || format === 'jpg') && densities.length === 0) {
          postMessage({ type: 'error', message: 'Не выбраны плотности' });
          break;
        }

        try {
          const response = await exportSelection(format, densities);
          postMessage({
            type: 'export-result',
            payload: { zipName: response.zipName, zipBytes: response.zipBytes },
          });
        } catch (error) {
          postMessage({ type: 'error', message: toMessage(error) });
        } finally {
          postMessage({ type: 'export-final' });
        }
        break;
      }
    }
  } catch (error) {
    postMessage({ type: 'error', message: toMessage(error) });
  }
};
