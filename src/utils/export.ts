import { RASTER_FOLDER } from '../constants';
import { RasterDensity } from '../types';

const sanitizeName = (name: string): string => {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
};

export const rasterPath = (
  nodeName: string,
  density: RasterDensity,
  ext: 'png' | 'jpg'
): string => {
  const base = sanitizeName(nodeName || 'asset');
  const folder = RASTER_FOLDER[density];

  return folder + '/' + base + '.' + ext;
};
export const svgPath = (nodeName: string): string => {
  const base = sanitizeName(nodeName || 'asset');

  return base + '.svg';
};
