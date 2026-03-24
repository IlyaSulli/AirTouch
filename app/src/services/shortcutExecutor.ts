import { getShortcuts, storeShortcuts } from './storage';
import { checkPermissionsForAction } from './permissions';
import {
  launchApp,
  openCamera,
  toggleBluetooth,
  toggleDoNotDisturb,
  adjustVolume,
  sendMediaKey,
} from '../../modules/shortcut-actions';
import {
  performSwipe,
  lockScreen,
  toggleQuickSettingsTile,
  findAndClickByText,
} from '../../modules/accessibility-bridge';

// Labels to search for in Quick Settings (multiple for OEM / locale variations)
const WIFI_TILE_LABELS = ['Wi-Fi', 'WiFi', 'WLAN', 'Internet'];
const MOBILE_DATA_TILE_LABELS = ['Mobile data', 'Mobile Data', 'Cellular data', 'Data', 'Internet'];
const POWER_SAVING_TILE_LABELS = ['Battery Saver', 'Power saving', 'Power Saving', 'Battery saver'];

// Camera UI element labels (text / content descriptions) for accessibility clicks
const FLIP_CAMERA_LABELS = [
  'Switch camera', 'Flip camera', 'Switch to front camera',
  'Switch to rear camera', 'Switch to back camera',
  'Switch to selfie camera', 'Toggle camera',
];
const SHUTTER_LABELS = [
  'Shutter', 'Shutter button', 'Take photo', 'Take picture',
  'Capture', 'Record video', 'Record', 'Camera shutter',
];
const CAMERA_MODE_LABELS = ['Video', 'Photo'];

/**
 * Execute the shortcut action assigned to a gesture number (1-3).
 * Returns true if the action was executed, false if skipped.
 */
export async function executeGestureAction(gestureNumber: number): Promise<boolean> {
  const shortcuts = await getShortcuts();
  const shortcut = shortcuts[gestureNumber - 1];

  if (!shortcut || !shortcut.isActive || !shortcut.action) {
    return false;
  }

  // Permission guard — skip if required permission is not granted
  const hasPermission = await checkPermissionsForAction(shortcut.action);
  if (!hasPermission) {
    console.warn(`Skipping "${shortcut.action.label}": required permission not granted`);
    return false;
  }

  const { action } = shortcut;
  let executed = false;

  try {
    switch (action.category) {
      case 'app':
        if (action.packageName) {
          await launchApp(action.packageName);
          executed = true;
        }
        break;

      case 'camera':
        switch (action.label) {
          case 'Open Camera':
            await openCamera();
            executed = true;
            break;
          case 'Flip Camera':
            // Open camera, wait for it to load, then click the switch-camera button
            await openCamera();
            await delay(800);
            try {
              await findAndClickByText(FLIP_CAMERA_LABELS, false);
            } catch {
              // Fallback: swipe gesture (works on some Samsung devices)
              await performSwipe('up');
            }
            executed = true;
            break;
          case 'Capture / Toggle Record':
            // Click the shutter / record button via accessibility
            try {
              await findAndClickByText(SHUTTER_LABELS, false);
            } catch {
              // Fallback: volume-up key which some camera apps map to shutter
              await adjustVolume('up');
            }
            executed = true;
            break;
          case 'Switch Camera Mode':
            // Toggle between Photo and Video by clicking the non-active mode tab
            try {
              await findAndClickByText(CAMERA_MODE_LABELS, true);
            } catch {
              // Fallback: swipe gesture to cycle modes
              await performSwipe('left');
            }
            executed = true;
            break;
        }
        break;

      case 'system':
        switch (action.label) {
          case 'Toggle Bluetooth':
            await toggleBluetooth();
            executed = true;
            break;
          case 'Toggle Do Not Disturb':
            await toggleDoNotDisturb();
            executed = true;
            break;
          case 'Toggle Wifi':
            await toggleQuickSettingsTile(WIFI_TILE_LABELS);
            executed = true;
            break;
          case 'Toggle Mobile Data':
            await toggleQuickSettingsTile(MOBILE_DATA_TILE_LABELS);
            executed = true;
            break;
          case 'Toggle Power Saving':
            await toggleQuickSettingsTile(POWER_SAVING_TILE_LABELS);
            executed = true;
            break;
          case 'Lock Screen':
            await lockScreen();
            executed = true;
            break;
        }
        break;

      case 'interaction':
        switch (action.label) {
          case 'Swipe Up':
            await performSwipe('up');
            executed = true;
            break;
          case 'Swipe Down':
            await performSwipe('down');
            executed = true;
            break;
          case 'Swipe Left':
            await performSwipe('left');
            executed = true;
            break;
          case 'Swipe Right':
            await performSwipe('right');
            executed = true;
            break;
        }
        break;

      case 'multimedia':
        switch (action.label) {
          case 'Volume Up':
            await adjustVolume('up');
            executed = true;
            break;
          case 'Volume Down':
            await adjustVolume('down');
            executed = true;
            break;
          case 'Pause / Play Media':
            await sendMediaKey('play_pause');
            executed = true;
            break;
          case 'Next Song':
            await sendMediaKey('next');
            executed = true;
            break;
          case 'Previous Song':
            await sendMediaKey('previous');
            executed = true;
            break;
        }
        break;
    }
  } catch (error) {
    console.warn(`Failed to execute action "${action.label}":`, error);
    return false;
  }

  if (executed) {
    const updated = shortcuts.map((s, i) =>
      i === gestureNumber - 1
        ? { ...s, lastUsed: new Date().toISOString() }
        : s
    );
    await storeShortcuts(updated);
  }

  return executed;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
