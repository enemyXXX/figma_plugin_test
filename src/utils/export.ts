import { RASTER_FOLDER } from '../constants';
import { ExportFormat, RasterDensity } from '../types';

const sanitizeName = (name: string): string => {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
};

export const rasterPath = (nodeName: string, density: RasterDensity, ext: ExportFormat): string => {
  const base = sanitizeName(nodeName || 'asset');
  const folder = RASTER_FOLDER[density];

  return folder + '/' + base + '.' + ext;
};
export const svgPath = (nodeName: string): string => {
  const base = sanitizeName(nodeName || 'asset');

  return base + '.svg';
};

const hasGlobalExport = (): boolean => {
  const g = figma as unknown as { exportAsync?: unknown };

  return typeof g.exportAsync === 'function';
};

type NodeWithExport = SceneNode & {
  exportAsync: (settings?: ExportSettings) => Promise<Uint8Array<ArrayBuffer>>;
};
const hasNodeExport = (n: SceneNode): n is NodeWithExport => {
  const node = n as unknown as { exportAsync?: unknown };

  return typeof node.exportAsync === 'function';
};

export const exportNodeBytes = (
  node: SceneNode,
  settings: ExportSettings
): Promise<Uint8Array<ArrayBuffer>> => {
  if (hasGlobalExport()) {
    const g = figma as unknown as {
      exportAsync: (node: SceneNode, settings?: ExportSettings) => Promise<Uint8Array<ArrayBuffer>>;
    };

    return g.exportAsync(node, settings);
  }

  if (hasNodeExport(node)) {
    return node.exportAsync(settings);
  }

  return Promise.reject(new Error('Этот узел не поддерживает экспорт'));
};
