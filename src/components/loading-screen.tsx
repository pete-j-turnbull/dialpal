"use client";

import { cn } from "@/lib/utils";

type LoadingScreenProps = {
  /**
   * Optional message to display below the spinner
   */
  message?: string;
  /**
   * Whether the loading screen should be full page overlay
   * @default true
   */
  fullScreen?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
};

export function LoadingScreen({
  message,
  fullScreen = true,
  className,
}: LoadingScreenProps) {
  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen
      ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      : "w-full h-full min-h-[200px]",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>

        {/* Loading message */}
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Alternative loading screen with dots animation
 */
export function LoadingDots({
  message,
  fullScreen = true,
  className,
}: LoadingScreenProps) {
  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen
      ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      : "w-full h-full min-h-[200px]",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated dots */}
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce"></div>
        </div>

        {/* Loading message */}
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

/**
 * Skeleton-based loading screen for content placeholders
 */
export function LoadingContent({
  lines = 3,
  showAvatar = false,
  className,
}: {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {showAvatar && (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-accent animate-pulse" />
            <div className="h-3 w-24 rounded bg-accent animate-pulse" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-accent animate-pulse"
            style={{
              width: `${Math.random() * 40 + 60}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
