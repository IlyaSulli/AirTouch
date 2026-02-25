// Development bypass for BLE functionality
// Set to false to use real BLE hardware
export const DEV_BYPASS_BLE = __DEV__ ?? false;

// Simulated device info
const FAKE_DEVICE = {
  id: 'dev-fake-arduino-001',
  name: 'Arduino UNO BLE 9205',
};

// Delay helper
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const fakeDiscoverDevice = async () => {
  await wait(2000 + Math.random() * 1500);
  return FAKE_DEVICE;
};

export const fakeGestureDetection = (
  expected: number,
  onDetected: (gesture: number) => void
): (() => void) => {
  // Simulate gesture detection after 1.5-4 seconds
  const timeout = setTimeout(() => {
    onDetected(expected);
  }, 1500 + Math.random() * 2500);

  return () => clearTimeout(timeout);
};
