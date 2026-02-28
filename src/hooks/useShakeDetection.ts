import { useRef } from 'react';
import {
  useAnimatedSensor,
  SensorType,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

const THRESHOLD = 18;         // m/s² — resting is ~9.8, a shake adds ~8+
const REQUIRED_SHAKES = 5;    // number of threshold-exceeding samples needed
const WINDOW_MS = 800;        // all shakes must occur within this window

/**
 * Detects sustained phone shaking via accelerometer.
 * Requires multiple sharp movements within a short window before firing.
 */
interface ShakeOptions {
  onShake: () => void;
  onShakeTick?: () => void;
  cooldownMs?: number;
}

export function useShakeDetection({ onShake, onShakeTick, cooldownMs = 4000 }: ShakeOptions) {
  const lastTriggerRef = useRef(0);
  const shakeTsRef = useRef<number[]>([]);
  const onShakeRef = useRef(onShake);
  const onShakeTickRef = useRef(onShakeTick);
  onShakeRef.current = onShake;
  onShakeTickRef.current = onShakeTick;

  const sensor = useAnimatedSensor(SensorType.ACCELEROMETER, { interval: 100 });

  useAnimatedReaction(
    () => {
      const { x, y, z } = sensor.sensor.value;
      return Math.sqrt(x * x + y * y + z * z);
    },
    (magnitude) => {
      if (magnitude > THRESHOLD) {
        runOnJS(recordShake)();
      }
    },
  );

  function recordShake() {
    const now = Date.now();

    // Still in cooldown from last trigger
    if (now - lastTriggerRef.current < cooldownMs) return;

    // Add timestamp and prune old entries outside the window
    const timestamps = shakeTsRef.current;
    timestamps.push(now);
    const cutoff = now - WINDOW_MS;
    while (timestamps.length > 0 && timestamps[0] < cutoff) {
      timestamps.shift();
    }

    // Haptic tick for each detected shake sample
    onShakeTickRef.current?.();

    if (timestamps.length >= REQUIRED_SHAKES) {
      lastTriggerRef.current = now;
      shakeTsRef.current = [];
      onShakeRef.current();
    }
  }
}
