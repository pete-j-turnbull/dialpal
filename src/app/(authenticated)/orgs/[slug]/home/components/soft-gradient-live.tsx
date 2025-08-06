import React, { useMemo } from "react";
import { motion } from "framer-motion";

/* ───────────────── types ───────────────── */
type GradientBlob = {
  x: number; // 0-1  (initial centre)
  y: number; // 0-1
  r: number; // 0-1  (size vs. shortest side)
  color: string; // hsla()
  amp: number; // 0-0.4  (how far the blob may wander)
  speed: number; // seconds   duration of one ‘cycle’
};

export interface SoftGradientLiveProps
  extends React.HTMLAttributes<HTMLDivElement> {
  seed: number | string;
  blobs?: number;
  variance?: number; // same as before
}

/* ───────────────── deterministic RNG ───────────────── */
const hash = (str: string) =>
  str.split("").reduce((h, c) => Math.imul(31, h) + c.charCodeAt(0), 0) >>> 0;

const rngFactory = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* ───────────────── palette helpers ───────────────── */
const MIN_SAT = 40; // ‰ 0-100  → subtle but clearly tinted
const MAX_SAT = 60;

const MIN_ALPHA = 0.5; // 0-1      → faint but visible
const MAX_ALPHA = 0.7;

const pastel = (
  rand: () => number,
  baseHue: number,
  variance: number,
): string => {
  const hue = (baseHue + (rand() - 0.5) * 16 + 360) % 360; // ±8 °
  const sat = MIN_SAT + (MAX_SAT - MIN_SAT) * variance;
  const light = 72 + 10 * variance;
  const alpha = MIN_ALPHA + (MAX_ALPHA - MIN_ALPHA) * variance;
  return `hsla(${hue.toFixed()}, ${sat.toFixed(
    1,
  )}%, ${light.toFixed(1)}%, ${alpha.toFixed(2)})`;
};

/* ───────────────── blob factory ───────────────── */
const makeBlob = (
  rand: () => number,
  baseHue: number,
  variance: number,
): GradientBlob => ({
  x: rand(),
  y: rand(),
  r: 0.32 + rand() * 0.3 * variance,
  color: pastel(rand, baseHue, variance),
  amp: 0.25 + rand() * 0.2 * variance, // 5-30 % drift
  speed: 10 + rand() * 5,
});

/* ───────────────── component ───────────────── */
export const SoftGradientLive: React.FC<SoftGradientLiveProps> = ({
  seed,
  blobs = 5,
  variance = 0.3,
  style,
  className = "",
  ...rest
}) => {
  const { blobList, baseTint } = useMemo(() => {
    const seedInt = typeof seed === "string" ? hash(seed) : seed >>> 0 || 1;
    const rand = rngFactory(seedInt);
    const baseHue = rand() * 360;
    return {
      baseTint: `hsla(${baseHue.toFixed()}, 22%, 96%, 0.5)`,
      blobList: Array.from({ length: blobs }, () =>
        makeBlob(rand, baseHue, variance),
      ),
    };
  }, [seed, blobs, variance]);

  return (
    <div
      {...rest}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        aspectRatio: "16 / 9",
        backgroundColor: baseTint,
        ...style,
      }}
    >
      {/* render a <motion.div> for each blob */}
      {blobList.map(({ x, y, r, color, amp, speed }, i) => {
        // pixel size relative to the container’s shorter edge (vmin)
        const size = `${r * 100}vmin`;

        /* each blob endlessly floats between two random offsets.
           repeatType:"mirror" gives a ping-pong motion.            */
        return (
          <motion.div
            key={i}
            initial={{ x: `${(x - 0.5) * 100}%`, y: `${(y - 0.5) * 100}%` }}
            animate={{
              x: [
                `${(x - 0.5) * 100}%`,
                `${(x - 0.5 + amp) * 100}%`,
                `${(x - 0.5 - amp) * 100}%`,
              ],
              y: [
                `${(y - 0.5) * 100}%`,
                `${(y - 0.5 - amp) * 100}%`,
                `${(y - 0.5 + amp) * 100}%`,
              ],
            }}
            transition={{
              duration: speed,
              ease: "linear",
              repeat: Infinity,
              repeatType: "mirror",
            }}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle at center, ${color} 0%, transparent 72%)`,
              filter: "blur(60px)",
              mixBlendMode: "normal",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </div>
  );
};
