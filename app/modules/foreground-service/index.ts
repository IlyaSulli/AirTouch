import { requireNativeModule, EventEmitter, Subscription } from "expo-modules-core";

const ForegroundServiceModule = requireNativeModule("ForegroundService");
const emitter = new EventEmitter(ForegroundServiceModule);

export async function startService(): Promise<void> {
  return ForegroundServiceModule.startService();
}

export async function stopService(): Promise<void> {
  return ForegroundServiceModule.stopService();
}

export async function isServiceRunning(): Promise<boolean> {
  return ForegroundServiceModule.isServiceRunning();
}

/**
 * Sync shortcut config and device ID to native SharedPreferences
 * so the background service can read them without JS.
 */
export async function syncConfig(
  shortcutsJson: string,
  deviceId: string
): Promise<void> {
  return ForegroundServiceModule.syncConfig(shortcutsJson, deviceId);
}

/**
 * Listen for gesture events emitted by the native BLE service.
 * Returns a subscription that should be removed on cleanup.
 */
export function addGestureListener(
  callback: (event: { gesture: number }) => void
): Subscription {
  return emitter.addListener("onGestureDetected", callback);
}
