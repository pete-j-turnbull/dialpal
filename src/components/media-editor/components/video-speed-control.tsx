import { Gauge } from "lucide-react";

import { formatVideoSpeed, getValidSpeedOptions } from "../helpers/video";
import { Slider } from "@/components/ui/slider";

type VideoSpeedControlProps = {
  playbackSpeed: number;
  maxAllowedSpeed: number;
  onSpeedChange: (value: number[]) => void;
  disabled?: boolean;
  className?: string;
};

// Get speed icon based on current speed
const getSpeedIcon = (speed: number) => {
  if (speed < 1) {
    return <Gauge className="h-3 w-3 rotate-[-45deg] text-blue-600" />;
  } else if (speed === 1) {
    return <Gauge className="h-3 w-3 text-gray-600" />;
  } else {
    return <Gauge className="h-3 w-3 rotate-45 text-red-600" />;
  }
};

export const VideoSpeedControl = ({
  playbackSpeed,
  maxAllowedSpeed,
  onSpeedChange,
  disabled = false,
  className,
}: VideoSpeedControlProps) => {
  const validSpeedOptions = getValidSpeedOptions(maxAllowedSpeed);
  const validSpeedIndex = validSpeedOptions.indexOf(playbackSpeed);

  return (
    <div className={className}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Speed:</span>
          {getSpeedIcon(playbackSpeed)}
          <span className="text-sm text-gray-600">
            {formatVideoSpeed(playbackSpeed)}
          </span>
        </div>
        <div className="relative">
          <Slider
            value={[validSpeedIndex >= 0 ? validSpeedIndex : 0]}
            onValueChange={onSpeedChange}
            max={validSpeedOptions.length - 1}
            min={0}
            step={1}
            className="w-full"
            disabled={disabled || validSpeedOptions.length <= 1}
          />
        </div>
      </div>
    </div>
  );
};
