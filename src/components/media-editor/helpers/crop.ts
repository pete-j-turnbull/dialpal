/**
 * Crop helper functions to convert between percentage-based UI values
 * and pixel-based storage values
 */

export type CropDataPercentage = {
  x: number; // 0-100 percentage from left
  y: number; // 0-100 percentage from top
  width: number; // 0-100 percentage of video width
  height: number; // 0-100 percentage of video height
};

export type CropDataPixels = {
  left: number; // Pixels from left edge
  right: number; // Pixels from right edge
  top: number; // Pixels from top edge
  bottom: number; // Pixels from bottom edge
};

/**
 * Convert percentage-based crop values (used in UI) to pixel-based values (used in storage)
 * @param cropPercentage - Crop values as percentages
 * @param videoWidth - Video width in pixels
 * @param videoHeight - Video height in pixels
 * @returns Crop values in pixels from edges
 */
export const convertCropPercentageToPixels = (
  cropPercentage: CropDataPercentage,
  videoWidth: number,
  videoHeight: number,
): CropDataPixels => {
  const left = Math.round((cropPercentage.x / 100) * videoWidth);
  const top = Math.round((cropPercentage.y / 100) * videoHeight);
  const cropWidth = Math.round((cropPercentage.width / 100) * videoWidth);
  const cropHeight = Math.round((cropPercentage.height / 100) * videoHeight);
  const right = videoWidth - (left + cropWidth);
  const bottom = videoHeight - (top + cropHeight);

  return {
    left,
    right,
    top,
    bottom,
  };
};

/**
 * Convert pixel-based crop values (used in storage) to percentage-based values (used in UI)
 * @param cropPixels - Crop values in pixels from edges
 * @param videoWidth - Video width in pixels
 * @param videoHeight - Video height in pixels
 * @returns Crop values as percentages
 */
export const convertCropPixelsToPercentage = (
  cropPixels: CropDataPixels,
  videoWidth: number,
  videoHeight: number,
): CropDataPercentage => {
  const x = (cropPixels.left / videoWidth) * 100;
  const y = (cropPixels.top / videoHeight) * 100;
  const width =
    ((videoWidth - cropPixels.left - cropPixels.right) / videoWidth) * 100;
  const height =
    ((videoHeight - cropPixels.top - cropPixels.bottom) / videoHeight) * 100;

  return {
    x,
    y,
    width,
    height,
  };
};

/**
 * Get default crop values (full frame, no cropping)
 */
export const getDefaultCropPercentage = (): CropDataPercentage => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
});

/**
 * Get default crop values in pixels (no cropping)
 */
export const getDefaultCropPixels = (): CropDataPixels => ({
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
});

/**
 * Check if crop is applied (not full frame)
 */
export const isCropApplied = (crop: CropDataPercentage): boolean => {
  return (
    crop.x !== 0 || crop.y !== 0 || crop.width !== 100 || crop.height !== 100
  );
};

/**
 * Check if crop pixels are applied (not full frame)
 */
export const isCropPixelsApplied = (crop: CropDataPixels): boolean => {
  return (
    crop.left !== 0 || crop.right !== 0 || crop.top !== 0 || crop.bottom !== 0
  );
};
