import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { AnimatedEllipsis } from '../components/AnimatedEllipsis';
import { requestBLEPermissions, scanForDevices, stopScan } from '../services/ble';
import { DEV_BYPASS_BLE, fakeDiscoverDevice } from '../services/devBypass';
import { scale } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export const SearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const [scanning, setScanning] = useState(true);
  const [failed, setFailed] = useState(false);
  const excludedIdsRef = useRef<string[]>(route.params?.excludedIds ?? []);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateToFound = useCallback(
    (id: string, name: string) => {
      setScanning(false);
      navigation.replace('DeviceFound', {
        deviceId: id,
        deviceName: name,
        excludedIds: excludedIdsRef.current,
      });
    },
    [navigation]
  );

  const startScan = useCallback(() => {
    setScanning(true);
    setFailed(false);

    if (DEV_BYPASS_BLE) {
      fakeDiscoverDevice().then((device) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        navigateToFound(device.id, device.name);
      });
    } else {
      scanForDevices((device: Device) => {
        stopScan();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        navigateToFound(
          device.id,
          device.name || device.localName || 'Unknown Device'
        );
      }, excludedIdsRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!DEV_BYPASS_BLE) stopScan();
      setScanning(false);
      setFailed(true);
    }, 120000);
  }, [navigateToFound]);

  useEffect(() => {
    if (DEV_BYPASS_BLE) {
      startScan();
    } else {
      (async () => {
        const granted = await requestBLEPermissions();
        if (granted) {
          startScan();
        } else {
          setFailed(true);
          setScanning(false);
        }
      })();
    }

    return () => {
      if (!DEV_BYPASS_BLE) stopScan();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [startScan]);

  return (
    <OnboardingLayout
      title="Let's get started."
      image={require('../../assets/setup/rings.png')}
      imageStyle="rings"
    >
      <View style={styles.content}>
        {scanning && (
          <NeumorphicButton
            onPress={() => {}}
            variant="inset"
            disabled
          >
            <AnimatedEllipsis text="Searching for ring" />
          </NeumorphicButton>
        )}

        {failed && (
          <NeumorphicButton
            label="Try Again"
            onPress={startScan}
            variant="red"
          />
        )}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
  },
});
