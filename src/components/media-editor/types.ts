export type CropData = {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  width: number; // 0-100 percentage
  height: number; // 0-100 percentage
};

export type VideoEditorProps = {
  videoUrl: string;
  videoDuration: number; // Full video length in ms
  sceneDuration: number; // Required scene length in ms
  trimStart: number; // Current trim start in ms
  trimEnd: number; // Current trim end in ms
  onTrimChange: (start: number, end: number) => void;
  onSpeedChange?: (speed: number) => void;
  onSpeedAndTrimChange?: (speed: number, start: number, end: number) => void;
  initialSpeed?: number;
  onCropChange?: (crop: CropData) => void;
  initialCrop?: CropData;
  className?: string;
};

export type CropDragState = {
  type: "move" | "resize";
  handle?: "tl" | "tr" | "bl" | "br";
  startX: number;
  startY: number;
  startCrop: CropData;
  aspectRatio: number;
};
