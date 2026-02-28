import { requireNativeModule } from "expo-modules-core";

const ShortcutActionsModule = requireNativeModule("ShortcutActions");

export async function launchApp(packageName: string): Promise<void> {
  return ShortcutActionsModule.launchApp(packageName);
}

export async function openCamera(): Promise<void> {
  return ShortcutActionsModule.openCamera();
}

export async function toggleBluetooth(): Promise<void> {
  return ShortcutActionsModule.toggleBluetooth();
}

export async function toggleDoNotDisturb(): Promise<void> {
  return ShortcutActionsModule.toggleDoNotDisturb();
}

export async function isDndAccessGranted(): Promise<boolean> {
  return ShortcutActionsModule.isDndAccessGranted();
}

export async function requestDndAccess(): Promise<void> {
  return ShortcutActionsModule.requestDndAccess();
}

export async function adjustVolume(direction: "up" | "down"): Promise<void> {
  return ShortcutActionsModule.adjustVolume(direction);
}

export async function sendMediaKey(
  action: "play_pause" | "next" | "previous"
): Promise<void> {
  return ShortcutActionsModule.sendMediaKey(action);
}
