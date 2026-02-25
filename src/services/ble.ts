import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

// Hardcoded UUIDs for the Arduino BLE service
const SERVICE_UUID = '19b10000-e8f2-537e-4f6c-d104768a1214';
const CHARACTERISTIC_UUID = '19b10001-e8f2-537e-4f6c-d104768a1214';

let manager: BleManager | null = null;

const getManager = (): BleManager | null => {
  if (!manager) {
    try {
      manager = new BleManager();
    } catch (e) {
      console.warn('BLE not available (native module missing):', e);
      return null;
    }
  }
  return manager;
};

export const isBLEAvailable = (): boolean => {
  return getManager() !== null;
};

export const requestBLEPermissions = async (): Promise<boolean> => {
  if (!isBLEAvailable()) return false;

  if (Platform.OS === 'android') {
    const apiLevel = Platform.Version;
    if (apiLevel >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
};

export const scanForDevices = (
  onDeviceFound: (device: Device) => void,
  excludedIds: string[] = []
): (() => void) => {
  const bleManager = getManager();
  if (!bleManager) {
    console.warn('BLE not available, scan skipped');
    return () => {};
  }

  bleManager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.warn('BLE scan error:', error.message);
      return;
    }
    if (
      device &&
      device.name &&
      !excludedIds.includes(device.id)
    ) {
      onDeviceFound(device);
    }
  });

  return () => {
    bleManager.stopDeviceScan();
  };
};

export const stopScan = () => {
  getManager()?.stopDeviceScan();
};

export const connectToDevice = async (
  deviceOrId: Device | string
): Promise<Device | null> => {
  if (typeof deviceOrId === 'string') {
    const bleManager = getManager();
    if (!bleManager) return null;
    const device = await bleManager.connectToDevice(deviceOrId);
    await device.discoverAllServicesAndCharacteristics();
    return device;
  }
  const connected = await deviceOrId.connect();
  await connected.discoverAllServicesAndCharacteristics();
  return connected;
};

export const listenForGestures = (
  device: Device,
  onGesture: (gesture: number) => void
): Subscription => {
  return device.monitorCharacteristicForService(
    SERVICE_UUID,
    CHARACTERISTIC_UUID,
    (error, characteristic) => {
      if (error) {
        console.warn('Gesture monitor error:', error.message);
        return;
      }
      if (characteristic?.value) {
        // Value is base64 encoded single byte - decode without Buffer
        const chars = atob(characteristic.value);
        if (chars.length > 0) {
          const gesture = chars.charCodeAt(0);
          if (gesture >= 1 && gesture <= 3) {
            onGesture(gesture);
          }
        }
      }
    }
  );
};

export const onDeviceDisconnected = (
  device: Device,
  callback: () => void
): Subscription | null => {
  const bleManager = getManager();
  if (!bleManager) return null;
  return bleManager.onDeviceDisconnected(device.id, () => {
    callback();
  });
};

export const destroyManager = () => {
  if (manager) {
    manager.destroy();
    manager = null;
  }
};
