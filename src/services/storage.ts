import AsyncStorage from '@react-native-async-storage/async-storage';

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
};

export const clearStoredDevice = async (): Promise<void> => {
  await AsyncStorage.removeItem(DEVICE_KEY);
};
