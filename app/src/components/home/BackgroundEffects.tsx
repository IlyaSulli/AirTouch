import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Pattern,
} from 'react-native-svg';

// ─── Noise texture (plastic backing) ──────────────────────────────────────────
// Uses an SVG pattern tile with small dots that repeats across the screen.
// Medium grain (2px), medium opacity for a subtle plastic texture.

const NOISE_TILE = 20;
const NOISE_DOT_SIZE = 5;

/** Deterministic pseudo-random dots for the pattern tile */
function generateNoiseDots(tileSize: number, count: number) {
  const dots: { x: number; y: number; opacity: number }[] = [];
  let seed = 42;
  const lcg = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < count; i++) {
    dots.push({
      x: Math.floor(lcg() * tileSize),
      y: Math.floor(lcg() * tileSize),
      opacity:  lcg() * 0.2,
    });
  }
  return dots;
}

const NOISE_DOTS = generateNoiseDots(NOISE_TILE, 30);

export const NoiseLayer: React.FC = React.memo(() => (
  <Svg
    width="100%"
    height="100%"
    style={[StyleSheet.absoluteFillObject, { opacity: 0.35 }]}
    pointerEvents="none"
  >
    <Defs>
      <Pattern
        id="noise"
        patternUnits="userSpaceOnUse"
        width={NOISE_TILE}
        height={NOISE_TILE}
      >
        {NOISE_DOTS.map((d, i) => (
          <Rect
            key={i}
            x={d.x}
            y={d.y}
            width={NOISE_DOT_SIZE}
            height={NOISE_DOT_SIZE}
            fill="#808080"
            opacity={d.opacity}
          />
        ))}
      </Pattern>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill="url(#noise)" />
  </Svg>
));

// ─── Blue glow (bottom center semicircle) ────────────────────────────────────
// Simulates a semicircle with heavy layerBlur, masked to the screen bounds.
// Uses a radial gradient centered at the bottom middle.

export const BlueGlow: React.FC = React.memo(() => (
  <Svg
    width="100%"
    height="100%"
    style={StyleSheet.absoluteFillObject}
    pointerEvents="none"
  >
    <Defs>
      <RadialGradient id="blueGlow" cx="0.5" cy="1" rx="0.70" ry="0.4">
        <Stop offset="0" stopColor="#0084FF" stopOpacity="0.40" />
        <Stop offset="0.45" stopColor="#0084FF" stopOpacity="0.10" />
        <Stop offset="0.75" stopColor="#0084FF" stopOpacity="0.06" />
        <Stop offset="1" stopColor="#0084FF" stopOpacity="0" />
      </RadialGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill="url(#blueGlow)" />
  </Svg>
));
