import { requireNativeModule } from "expo-modules-core";

const AccessibilityBridgeModule = requireNativeModule("AccessibilityBridge");

export async function isAccessibilityServiceEnabled(): Promise<boolean> {
  return AccessibilityBridgeModule.isAccessibilityServiceEnabled();
}

export async function openAccessibilitySettings(): Promise<void> {
  return AccessibilityBridgeModule.openAccessibilitySettings();
}

export async function performSwipe(
  direction: "up" | "down" | "left" | "right"
): Promise<void> {
  return AccessibilityBridgeModule.performSwipe(direction);
}

export async function lockScreen(): Promise<void> {
  return AccessibilityBridgeModule.lockScreen();
}

/**
 * Toggle a Quick Settings tile by searching for matching text labels.
 * Provide multiple labels for localization / OEM variations.
 */
export async function toggleQuickSettingsTile(
  tileLabels: string[]
): Promise<void> {
  return AccessibilityBridgeModule.toggleQuickSettingsTile(tileLabels);
}

/**
 * Find a UI element by text / content description and click it.
 * If preferUnselected is true, non-selected nodes are preferred (useful
 * for toggling between tabs like Photo / Video).
 */
export async function findAndClickByText(
  labels: string[],
  preferUnselected: boolean = false
): Promise<void> {
  return AccessibilityBridgeModule.findAndClickByText(labels, preferUnselected);
}
