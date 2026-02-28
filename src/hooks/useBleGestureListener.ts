import { useEffect, useRef, useState, useCallback } from 'react';
import { Subscription as BleSubscription, State } from 'react-native-ble-plx';
import { Subscription as ExpoSubscription } from 'expo-modules-core';
import { connectToDevice, listenForGestures, onDeviceDisconnected, isBLEAvailable, getManager } from '../services/ble';
import { getStoredDevice } from '../services/storage';
import { executeGestureAction } from '../services/shortcutExecutor';
import { DEV_BYPASS_BLE } from '../services/devBypass';
import {
  startService,
  stopService,
  addGestureListener,
  syncConfig,
} from '../../modules/foreground-service';
import { getShortcuts } from '../services/storage';

const RECONNECT_DELAY_MS = 3000;
const MAX_RETRIES = 5;

interface BleGestureListenerResult {
  /** The last gesture number detected (1-3), or null if none yet */
  detectedGesture: number | null;
  /** Whether the BLE device is currently connected */
  isConnected: boolean;
  /** Name of the connected device, or null */
  connectedDeviceName: string | null;
}

/**
 * Waits for the BLE adapter to reach PoweredOn state.
 */
function waitForBlePoweredOn(mountedRef: React.MutableRefObject<boolean>): Promise<boolean> {
  return new Promise((resolve) => {
    const bleManager = getManager();
    if (!bleManager) { resolve(false); return; }

    const sub = bleManager.onStateChange((state) => {
      if (!mountedRef.current) { sub.remove(); resolve(false); return; }
      if (state === State.PoweredOn) {
        sub.remove();
        resolve(true);
      }
    }, true);
  });
}

/**
 * Performs initial sync of shortcuts + device config to native SharedPreferences
 * and starts the foreground service for background BLE listening.
 */
async function initForegroundService(): Promise<void> {
  try {
    const [shortcuts, device] = await Promise.all([
      getShortcuts(),
      getStoredDevice(),
    ]);
    if (!device) return;
    await syncConfig(JSON.stringify(shortcuts), device.id);
    await startService();
  } catch (e) {
    console.warn('Failed to start foreground service:', e);
  }
}

/**
 * Connects to the stored BLE device, listens for gestures,
 * and executes the assigned shortcut action for each gesture.
 *
 * In production: starts the native foreground service for background
 * execution, and listens for gesture events from the native service
 * for UI updates. The JS-side BLE connection provides gesture
 * execution while the app is foregrounded.
 */
export function useBleGestureListener(): BleGestureListenerResult {
  const [detectedGesture, setDetectedGesture] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);

  const gestureSubRef = useRef<BleSubscription | null>(null);
  const disconnectSubRef = useRef<BleSubscription | null>(null);
  const nativeGestureSubRef = useRef<ExpoSubscription | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const retriesRef = useRef(0);

  const cleanup = useCallback(() => {
    gestureSubRef.current?.remove();
    gestureSubRef.current = null;
    disconnectSubRef.current?.remove();
    disconnectSubRef.current = null;
    nativeGestureSubRef.current?.remove();
    nativeGestureSubRef.current = null;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!mountedRef.current) return;
    if (DEV_BYPASS_BLE || !isBLEAvailable()) return;

    const storedDevice = await getStoredDevice();
    if (!storedDevice || !mountedRef.current) return;

    const ready = await waitForBlePoweredOn(mountedRef);
    if (!ready || !mountedRef.current) return;

    try {
      const device = await connectToDevice(storedDevice.id);
      if (!device || !mountedRef.current) return;

      retriesRef.current = 0;
      setIsConnected(true);
      setConnectedDeviceName(storedDevice.name);

      // Listen for gestures via JS BLE bridge (foreground execution)
      gestureSubRef.current = listenForGestures(device, (gesture: number) => {
        if (!mountedRef.current) return;
        setDetectedGesture(gesture);
        executeGestureAction(gesture).catch((err) =>
          console.warn('Shortcut execution error:', err)
        );
      });

      disconnectSubRef.current = onDeviceDisconnected(device, () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        setConnectedDeviceName(null);
        gestureSubRef.current?.remove();
        gestureSubRef.current = null;
        retriesRef.current = 0;

        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, RECONNECT_DELAY_MS);
      });
    } catch (error) {
      if (!mountedRef.current) return;
      setIsConnected(false);
      retriesRef.current += 1;

      if (retriesRef.current < MAX_RETRIES) {
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, RECONNECT_DELAY_MS * retriesRef.current);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Start native foreground service for background execution
    if (!DEV_BYPASS_BLE) {
      initForegroundService();

      // Listen for gesture events from native service (for UI updates)
      nativeGestureSubRef.current = addGestureListener((event) => {
        if (mountedRef.current) {
          setDetectedGesture(event.gesture);
        }
      });
    }

    // Also connect via JS BLE bridge for foreground execution
    connect();

    return () => {
      mountedRef.current = false;
      cleanup();
      // Stop the foreground service so shortcuts don't fire during onboarding
      stopService().catch(() => {});
    };
  }, [connect, cleanup]);

  return { detectedGesture, isConnected, connectedDeviceName };
}
