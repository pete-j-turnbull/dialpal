import { useCallback, useRef } from "react";
import { motion } from "framer-motion";

import { formatVideoTime } from "../helpers/video";

type VideoTimelineProps = {
  videoDuration: number;
  trimStart: number;
  trimEnd: number;
  currentTime: number;
  isPlaying: boolean;
  onTimelineDrag: (clientX: number) => void;
  onMouseDown: () => void;
  className?: string;
};

export const VideoTimeline = ({
  videoDuration,
  trimStart,
  trimEnd,
  currentTime,
  isPlaying,
  onTimelineDrag,
  onMouseDown,
  className,
}: VideoTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate positions as percentages
  const trimStartPercent = (trimStart / videoDuration) * 100;
  const trimWidthPercent = ((trimEnd - trimStart) / videoDuration) * 100;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      onMouseDown();
      onTimelineDrag(e.clientX);
    },
    [onTimelineDrag, onMouseDown]
  );

  return (
    <div className={className}>
      <div
        ref={timelineRef}
        className="relative h-16 cursor-pointer overflow-hidden rounded-lg bg-gray-100"
        onMouseDown={handleMouseDown}
      >
        {/* Unselected areas */}
        <div className="absolute inset-0 bg-gray-200" />

        {/* Selected area */}
        <motion.div
          className="absolute top-0 h-full border-2 border-blue-500 bg-blue-500/30"
          initial={false}
          animate={{
            left: `${trimStartPercent}%`,
            width: `${trimWidthPercent}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Start handle */}
          <div className="absolute bottom-0 left-0 top-0 w-1 cursor-ew-resize bg-blue-600" />

          {/* End handle */}
          <div className="absolute bottom-0 right-0 top-0 w-1 cursor-ew-resize bg-blue-600" />

          {/* Time labels */}
          <div className="absolute -top-6 left-0 text-xs text-gray-700">
            {formatVideoTime(trimStart)}
          </div>
          <div className="absolute -top-6 right-0 text-xs text-gray-700">
            {formatVideoTime(trimEnd)}
          </div>
        </motion.div>

        {/* Current playhead */}
        {isPlaying && (
          <motion.div
            className="absolute bottom-0 top-0 w-0.5 bg-red-500"
            initial={false}
            animate={{
              left: `${(currentTime / videoDuration) * 100}%`,
            }}
          />
        )}

        {/* Hover preview line */}
        <div className="pointer-events-none absolute inset-0">
          <div className="h-full w-px bg-gray-400 opacity-0 transition-opacity hover:opacity-50" />
        </div>
      </div>
    </div>
  );
};
