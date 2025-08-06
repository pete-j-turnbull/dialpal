import { useCallback, useEffect, useRef, useState } from "react";

import type { CropData, CropDragState } from "../types";
import { cn } from "@/lib/utils";

type CropOverlayProps = {
  crop: CropData;
  onCropChange: (crop: CropData) => void;
  isActive: boolean;
  className?: string;
};

export const CropOverlay = ({
  crop,
  onCropChange,
  isActive,
  className,
}: CropOverlayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<CropDragState | null>(null);

  // Handle crop resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: "tl" | "tr" | "bl" | "br") => {
      e.preventDefault();
      e.stopPropagation();
      const aspectRatio = crop.width / crop.height;
      setDragState({
        type: "resize",
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startCrop: { ...crop },
        aspectRatio,
      });
    },
    [crop]
  );

  // Handle crop move start
  const handleMoveStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const aspectRatio = crop.width / crop.height;
      setDragState({
        type: "move",
        startX: e.clientX,
        startY: e.clientY,
        startCrop: { ...crop },
        aspectRatio,
      });
    },
    [crop]
  );

  // Handle crop resize/move
  useEffect(() => {
    if (!dragState || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const bounds = containerRef.current!.getBoundingClientRect();
      const deltaX = ((e.clientX - dragState.startX) / bounds.width) * 100;
      const deltaY = ((e.clientY - dragState.startY) / bounds.height) * 100;

      const newCrop = { ...dragState.startCrop };

      if (dragState.type === "move") {
        // Move the entire crop box
        newCrop.x = Math.max(
          0,
          Math.min(
            100 - dragState.startCrop.width,
            dragState.startCrop.x + deltaX
          )
        );
        newCrop.y = Math.max(
          0,
          Math.min(
            100 - dragState.startCrop.height,
            dragState.startCrop.y + deltaY
          )
        );
      } else if (dragState.type === "resize" && dragState.handle) {
        const minSize = 10; // Minimum 10% size

        // Calculate new dimensions based on which handle is being dragged
        switch (dragState.handle) {
          case "br": {
            // Bottom-right: increase size
            const widthChange = deltaX;
            const heightChange = deltaY;

            // Use the larger change to maintain aspect ratio
            const change =
              Math.abs(widthChange) > Math.abs(heightChange)
                ? widthChange
                : heightChange;

            newCrop.width = Math.max(
              minSize,
              Math.min(100 - newCrop.x, dragState.startCrop.width + change)
            );
            newCrop.height = newCrop.width / dragState.aspectRatio;

            // Ensure it doesn't exceed bottom boundary
            if (newCrop.y + newCrop.height > 100) {
              newCrop.height = 100 - newCrop.y;
              newCrop.width = newCrop.height * dragState.aspectRatio;
            }
            break;
          }
          case "tl": {
            // Top-left: move position and decrease size
            const widthChange = -deltaX;
            const heightChange = -deltaY;

            const change =
              Math.abs(widthChange) > Math.abs(heightChange)
                ? widthChange
                : heightChange;

            const newWidth = Math.max(
              minSize,
              dragState.startCrop.width + change
            );
            const newHeight = newWidth / dragState.aspectRatio;

            // Adjust position
            newCrop.x =
              dragState.startCrop.x + dragState.startCrop.width - newWidth;
            newCrop.y =
              dragState.startCrop.y + dragState.startCrop.height - newHeight;
            newCrop.width = newWidth;
            newCrop.height = newHeight;

            // Ensure it doesn't go beyond boundaries
            if (newCrop.x < 0) {
              newCrop.x = 0;
              newCrop.width = dragState.startCrop.x + dragState.startCrop.width;
              newCrop.height = newCrop.width / dragState.aspectRatio;
              newCrop.y =
                dragState.startCrop.y +
                dragState.startCrop.height -
                newCrop.height;
            }
            if (newCrop.y < 0) {
              newCrop.y = 0;
              newCrop.height =
                dragState.startCrop.y + dragState.startCrop.height;
              newCrop.width = newCrop.height * dragState.aspectRatio;
              newCrop.x =
                dragState.startCrop.x +
                dragState.startCrop.width -
                newCrop.width;
            }
            break;
          }
          case "tr": {
            // Top-right: adjust y position and increase width
            const widthChange = deltaX;
            const heightChange = -deltaY;

            const change =
              Math.abs(widthChange) > Math.abs(heightChange)
                ? widthChange
                : heightChange;

            newCrop.width = Math.max(
              minSize,
              Math.min(100 - newCrop.x, dragState.startCrop.width + change)
            );
            newCrop.height = newCrop.width / dragState.aspectRatio;
            newCrop.y =
              dragState.startCrop.y +
              dragState.startCrop.height -
              newCrop.height;

            // Ensure it doesn't go beyond top boundary
            if (newCrop.y < 0) {
              newCrop.y = 0;
              newCrop.height =
                dragState.startCrop.y + dragState.startCrop.height;
              newCrop.width = newCrop.height * dragState.aspectRatio;
            }
            break;
          }
          case "bl": {
            // Bottom-left: adjust x position and increase height
            const widthChange = -deltaX;
            const heightChange = deltaY;

            const change =
              Math.abs(widthChange) > Math.abs(heightChange)
                ? widthChange
                : heightChange;

            const newWidth = Math.max(
              minSize,
              dragState.startCrop.width + change
            );
            const newHeight = newWidth / dragState.aspectRatio;

            newCrop.x =
              dragState.startCrop.x + dragState.startCrop.width - newWidth;
            newCrop.width = newWidth;
            newCrop.height = newHeight;

            // Ensure it doesn't go beyond boundaries
            if (newCrop.x < 0) {
              newCrop.x = 0;
              newCrop.width = dragState.startCrop.x + dragState.startCrop.width;
              newCrop.height = newCrop.width / dragState.aspectRatio;
            }
            if (newCrop.y + newCrop.height > 100) {
              newCrop.height = 100 - newCrop.y;
              newCrop.width = newCrop.height * dragState.aspectRatio;
              newCrop.x =
                dragState.startCrop.x +
                dragState.startCrop.width -
                newCrop.width;
            }
            break;
          }
        }
      }

      onCropChange(newCrop);
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, onCropChange]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {/* Dark overlay outside crop area */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="absolute bg-transparent"
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.width}%`,
            height: `${crop.height}%`,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
          }}
        />
      </div>

      {/* Crop Box */}
      <div
        className="pointer-events-auto absolute cursor-move border-2 border-white shadow-lg"
        style={{
          left: `${crop.x}%`,
          top: `${crop.y}%`,
          width: `${crop.width}%`,
          height: `${crop.height}%`,
        }}
        onMouseDown={handleMoveStart}
      >
        {/* Grid lines for rule of thirds */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/3 top-0 w-px bg-white/20" />
          <div className="absolute bottom-0 left-2/3 top-0 w-px bg-white/20" />
          <div className="absolute left-0 right-0 top-1/3 h-px bg-white/20" />
          <div className="absolute left-0 right-0 top-2/3 h-px bg-white/20" />
        </div>

        {/* Corner handles - resize with aspect ratio maintained */}
        <div
          className="absolute -left-2 -top-2 z-10 h-4 w-4 cursor-nw-resize rounded-sm border-2 border-white bg-blue-500 transition-colors hover:bg-blue-600"
          onMouseDown={(e) => handleResizeStart(e, "tl")}
        />
        <div
          className="absolute -right-2 -top-2 z-10 h-4 w-4 cursor-ne-resize rounded-sm border-2 border-white bg-blue-500 transition-colors hover:bg-blue-600"
          onMouseDown={(e) => handleResizeStart(e, "tr")}
        />
        <div
          className="absolute -bottom-2 -left-2 z-10 h-4 w-4 cursor-sw-resize rounded-sm border-2 border-white bg-blue-500 transition-colors hover:bg-blue-600"
          onMouseDown={(e) => handleResizeStart(e, "bl")}
        />
        <div
          className="absolute -bottom-2 -right-2 z-10 h-4 w-4 cursor-se-resize rounded-sm border-2 border-white bg-blue-500 transition-colors hover:bg-blue-600"
          onMouseDown={(e) => handleResizeStart(e, "br")}
        />
      </div>
    </div>
  );
};
