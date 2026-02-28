import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureShortcut, DEFAULT_SHORTCUTS } from '../types/shortcuts';
import { syncConfig } from '../../modules/foreground-service';

const DEVICE_KEY = '@stored_device';

export interface StoredDevice {
  id: string;
  name: string;
}

export const getStoredDevice = async (): Promise<StoredDevice | null> => {
  try {
    const json = await AsyncStorage.getItem(DEVICE_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};

export const storeDevice = async (device: StoredDevice): Promise<void> => {
  await AsyncStorage.setItem(DEVICE_KEY, JSON.stringify(device));
  syncNativeConfig();
};

export const clearStoredDevice = async (): Promise<void> => {
  await AsyncStorage.removeItem(DEVICE_KEY);
};

// --- Shortcut persistence ---

const SHORTCUTS_KEY = '@shortcuts';
export const getShortcuts = async (): Promise<GestureShortcut[]> => {
  try {
    const json = await AsyncStorage.getItem(SHORTCUTS_KEY);
    if (!json) return DEFAULT_SHORTCUTS;
    const parsed: GestureShortcut[] = JSON.parse(json);
    // Migrate old data that may lack isActive
    return parsed.map(s => ({ ...s, isActive: s.isActive ?? false }));
  } catch {
    return DEFAULT_SHORTCUTS;
  }
};

export const storeShortcuts = async (shortcuts: GestureShortcut[]): Promise<void> => {
  await AsyncStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
  syncNativeConfig();
};

// --- Theme persistence ---

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = '@theme_mode';

export const getThemeMode = async (): Promise<ThemeMode> => {
  try {
    const val = await AsyncStorage.getItem(THEME_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') return val;
    return 'light';
  } catch {
    return 'light';
  }
};

export const storeThemeMode = async (mode: ThemeMode): Promise<void> => {
  await AsyncStorage.setItem(THEME_KEY, mode);
};

// --- Native config sync (for background foreground service) ---

/**
 * Pushes current shortcuts + device ID to native SharedPreferences
 * so BleGestureService can read them without the JS bridge.
 */
const syncNativeConfig = async (): Promise<void> => {
  try {
    const [shortcuts, device] = await Promise.all([
      AsyncStorage.getItem(SHORTCUTS_KEY),
      AsyncStorage.getItem(DEVICE_KEY),
    ]);
    const deviceId = device ? (JSON.parse(device) as StoredDevice).id : '';
    await syncConfig(shortcuts ?? JSON.stringify(DEFAULT_SHORTCUTS), deviceId);
  } catch (e) {
    console.warn('Failed to sync native config:', e);
  }
};
