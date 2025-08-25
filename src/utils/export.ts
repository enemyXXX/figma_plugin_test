import { RASTER_FOLDER, UNSORTED_FOLDER } from '../constants';
import { ExportFormat, RasterDensity } from '../types';

type RectLike = { x: number; y: number; width: number; height: number };
type NodeWithGeom = SceneNode & {
  width?: number;
  height?: number;
  absoluteRenderBounds?: RectLike | null;
};

export const getNodeBaseSize = (node: SceneNode): number => {
  const n = node as NodeWithGeom;
  let width = 0;
  let height = 0;
  if (typeof n.absoluteRenderBounds === 'object' && n.absoluteRenderBounds) {
    width = n.absoluteRenderBounds.width;
    height = n.absoluteRenderBounds.height;
  } else {
    width = n.width;
    height = n.height;
  }
  const size = Math.max(width, height);

  return Math.round(size);
};

const sanitizeName = (name: string): string => {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
};

export const rasterPath = ({
  nodeName,
  density,
  exportFormat,
  groupBySize,
  baseSize,
}: {
  nodeName: string;
  density: RasterDensity;
  exportFormat: ExportFormat;
  groupBySize: boolean;
  baseSize: number;
}): string => {
  const base = sanitizeName(nodeName || 'asset');
  const densityFolder = RASTER_FOLDER[density];
  const groupFolder = groupBySize && baseSize > 0 ? String(baseSize) : UNSORTED_FOLDER;

  return groupFolder + '/' + densityFolder + '/' + base + '.' + exportFormat;
};
export const svgPath = ({
  nodeName,
  groupBySize,
  baseSize,
}: {
  nodeName: string;
  groupBySize: boolean;
  baseSize: number;
}): string => {
  const base = sanitizeName(nodeName || 'asset');
  const groupFolder = groupBySize && baseSize > 0 ? String(baseSize) : UNSORTED_FOLDER;

  return groupFolder + '/' + base + '.svg';
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
