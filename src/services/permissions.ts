import { ShortcutAction } from '../types/shortcuts';
import { isDndAccessGranted, requestDndAccess } from '../../modules/shortcut-actions';
import {
  isAccessibilityServiceEnabled,
  openAccessibilitySettings,
} from '../../modules/accessibility-bridge';

/**
 * Actions that require DND (Do Not Disturb) policy access.
 */
const DND_ACTIONS = ['Toggle Do Not Disturb'];

/**
 * Actions that require the Accessibility Service.
 */
const ACCESSIBILITY_ACTIONS = [
  'Toggle Wifi',
  'Toggle Mobile Data',
  'Toggle Power Saving',
  'Lock Screen',
  'Swipe Up',
  'Swipe Down',
  'Swipe Left',
  'Swipe Right',
  'Flip Camera',
  'Capture / Toggle Record',
  'Switch Camera Mode',
];

export interface PermissionStatus {
  dndAccess: boolean;
  accessibilityService: boolean;
}

/**
 * Check all permission statuses at once.
 */
export async function checkAllPermissions(): Promise<PermissionStatus> {
  const [dndAccess, accessibilityService] = await Promise.all([
    isDndAccessGranted(),
    isAccessibilityServiceEnabled(),
  ]);
  return { dndAccess, accessibilityService };
}

/**
 * Check if the required permissions for an action are granted.
 * Returns true if all permissions are met (or no special permissions needed).
 */
export async function checkPermissionsForAction(action: ShortcutAction): Promise<boolean> {
  if (DND_ACTIONS.includes(action.label)) {
    return await isDndAccessGranted();
  }
  if (ACCESSIBILITY_ACTIONS.includes(action.label)) {
    return await isAccessibilityServiceEnabled();
  }
  return true;
}

/**
 * Request the permissions needed for a given action.
 * Opens the relevant settings screen.
 */
export async function requestPermissionsForAction(action: ShortcutAction): Promise<void> {
  if (DND_ACTIONS.includes(action.label)) {
    await requestDndAccess();
    return;
  }
  if (ACCESSIBILITY_ACTIONS.includes(action.label)) {
    await openAccessibilitySettings();
    return;
  }
}

/**
 * Check whether an action requires the Accessibility Service.
 */
export function requiresAccessibilityService(action: ShortcutAction): boolean {
  return ACCESSIBILITY_ACTIONS.includes(action.label);
}

/**
 * Check whether an action requires DND access.
 */
export function requiresDndAccess(action: ShortcutAction): boolean {
  return DND_ACTIONS.includes(action.label);
}
