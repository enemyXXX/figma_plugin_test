import JSZip from 'jszip';

import { RASTER_DENSITIES, RASTER_SCALE } from './constants';
import {
  ExportFormat,
  PluginToUIMessage,
  RasterDensity,
  RepoKind,
  UIToPluginMessage,
} from './types';
import { verifyTokenByKind } from './utils/api';
import { rasterPath, svgPath } from './utils/export';
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

function emitSelection(): void {
  figma.ui.postMessage({ type: 'selection', payload: computeSelectionCount() });
}

async function exportSelection(
  format: ExportFormat,
  densities: ReadonlyArray<RasterDensity>,
  jpgQuality: number | undefined
): Promise<{ zipName: string; zipBytes: Uint8Array<ArrayBuffer> }> {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    postMessage({ type: 'error', message: 'Ничего не выделено' });
  }

  const zip = new JSZip();

  for (let i = 0; i < selection.length; i++) {
    const node = selection[i];
    const nodeName = node.name || 'asset_' + String(i + 1);

    if (format === 'svg') {
      const svgBytes = await figma.exportAsync(node, {
        format: 'SVG',
        useAbsoluteBounds: true,
        svgOutlineText: true,
        svgIdAttribute: true,
        svgSimplifyStroke: false,
      });
      zip.file(svgPath(nodeName), svgBytes);
      continue;
    }

    const actualDensities = densities.length ? densities : RASTER_DENSITIES;
    const quality = typeof jpgQuality === 'number' ? Math.min(Math.max(jpgQuality, 0), 1) : 0.9;

    for (let j = 0; j < actualDensities.length; j++) {
      const density = actualDensities[j];
      const scale = RASTER_SCALE[density];

      if (format === 'png') {
        const bytes = await figma.exportAsync(node, {
          format: 'PNG',
          useAbsoluteBounds: true,
          constraint: { type: 'SCALE', value: scale },
        });
        zip.file(rasterPath(nodeName, density, 'png'), bytes);
      } else {
        const bytes = await figma.exportAsync(node, {
          format: 'JPG',
          useAbsoluteBounds: true,
          constraint: { type: 'SCALE', value: scale },
          jpgQuality: quality,
        });
        zip.file(rasterPath(nodeName, density, 'jpg'), bytes);
      }
    }
  }

  const zipBytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  return { zipName: 'images_export.zip', zipBytes };
}

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

figma.ui.onmessage = async function (msg: UIToPluginMessage): Promise<void> {
  try {
    switch (msg.type) {
      case 'set-selected': {
        const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : 'public-icons';
        await Storage.setRepoKind(kind);
        postMessage({ type: 'selected-saved', payload: { kind } });
        break;
      }

      case 'save-token': {
        const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : 'public-icons';
        const token = msg.payload.token;

        if (kind === 'public-icons' && !/^ghp_|^github_pat_/.test(token)) {
          postMessage({ type: 'error', message: 'Ожидается GitHub PAT (ghp_… или github_pat_…)' });
          return;
        }

        await Storage.setToken(kind, token);
        postMessage({ type: 'token-saved', payload: { kind, token } });
        break;
      }

      case 'clear-token': {
        const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : 'public-icons';
        await Storage.clearToken(kind);
        postMessage({ type: 'token-cleared', payload: { kind } });
        break;
      }

      case 'check-token': {
        const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : 'public-icons';
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
        const format = msg.payload.format;
        const densities: RasterDensity[] = [];
        const input = msg.payload.densities || [];
        for (let i = 0; i < input.length; i++) {
          const density = input[i];
          if (RASTER_DENSITIES.indexOf(density) >= 0) densities.push(density);
        }
        const jpgQuality =
          typeof msg.payload.jpgQuality === 'number' ? msg.payload.jpgQuality : undefined;
        const zipName =
          msg.payload.zipName && msg.payload.zipName.trim()
            ? msg.payload.zipName.trim()
            : 'images_export.zip';

        if ((format === 'png' || format === 'jpg') && densities.length === 0) {
          postMessage({ type: 'error', message: 'Не выбраны плотности' });
          break;
        }

        try {
          const res = await exportSelection(format, densities, jpgQuality);
          postMessage({
            type: 'export-result',
            payload: { ok: true, zipName: zipName || res.zipName, zipBytes: res.zipBytes },
          });
        } catch (e) {
          postMessage({ type: 'error', message: toMessage(e) });
        }
        break;
      }
    }
  } catch (e) {
    postMessage({ type: 'error', message: toMessage(e) });
  }
};
