"use client";

type Props = {
  seed?: string | number;
  size?: "sm" | "md" | "lg" | number; // predefined sizes or custom number
  className?: string;
};

// Simple seeded random function
function seededRandom(seed: string | number): () => number {
  // Convert seed to string and then to a numeric hash
  const seedStr = String(seed);
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // seeded random generator
  return () => {
    // Simple linear congruential generator
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

// Generate a pleasant HSL color
function generatePleasantColor(
  random: () => number,
  hueOffset = 0,
  saturationRange = [70, 100],
  lightnessRange = [45, 65]
): string {
  const hue = Math.floor(random() * 360 + hueOffset) % 360;
  const saturation = Math.floor(
    random() * (saturationRange[1] - saturationRange[0]) + saturationRange[0]
  );
  const lightness = Math.floor(
    random() * (lightnessRange[1] - lightnessRange[0]) + lightnessRange[0]
  );

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export const GradientCircle = (props: Props) => {
  const { className, seed = "yuzu", size = "sm" } = props;

  // Size mapping for predefined sizes (in pixels)
  const sizeMap = {
    sm: 20, // 5 * 4 = 20px (size-5)
    md: 32, // 8 * 4 = 32px (size-8)
    lg: 48, // 12 * 4 = 48px (size-12)
  };

  // Determine the actual pixel size based on the size prop
  const pixelSize = typeof size === "number" ? size : sizeMap[size];

  // Generate random gradient if seed is provided (or use default seed) and colors aren't explicitly provided
  const random = seededRandom(seed);

  // Determine colors based on props or seed
  const bgColor = generatePleasantColor(random);
  // Generate a primary color that's harmonious with the background (180° hue shift)
  const primaryCol = generatePleasantColor(random, 180, [70, 95], [55, 75]);

  // Generate a unique ID for the gradient based on the seed
  const gradientId = `gradient-${String(seed).replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 180 180"
      className={className}
      style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
      fill="currentColor"
    >
      <circle cx="90" cy="90" r="87" fill={`url(#${gradientId})`} />
      <defs>
        <linearGradient id={gradientId} gradientTransform="rotate(45)">
          <stop offset="45%" stopColor={bgColor} />
          <stop offset="100%" stopColor={primaryCol} />
        </linearGradient>
      </defs>
    </svg>
  );
};
