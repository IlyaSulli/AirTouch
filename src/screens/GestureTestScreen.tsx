import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Subscription } from 'react-native-ble-plx';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { GestureBox } from '../components/GestureBox';
import { listenForGestures, connectToDevice, isBLEAvailable } from '../services/ble';
import { DEV_BYPASS_BLE, fakeGestureDetection } from '../services/devBypass';
import { COLORS, FONTS, scale, verticalScale } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GestureTest'>;

export const GestureTestScreen: React.FC<Props> = ({ navigation, route }) => {
  const { deviceId, deviceName, gestureNumber } = route.params;
  const [detected, setDetected] = useState(false);
  const [detectedValue, setDetectedValue] = useState<number | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    if (DEV_BYPASS_BLE) {
      cleanupRef.current = fakeGestureDetection(gestureNumber, (gesture) => {
        if (mounted) {
          setDetected(true);
          setDetectedValue(gesture);
        }
      });
    } else {
      const setup = async () => {
        if (!isBLEAvailable()) return;

        try {
          const device = await connectToDevice(deviceId);
          if (!device || !mounted) return;

          subscriptionRef.current = listenForGestures(device, (gesture) => {
            if (mounted && gesture === gestureNumber) {
              setDetected(true);
              setDetectedValue(gesture);
              subscriptionRef.current?.remove();
            }
          });
        } catch (error) {
          console.warn('Gesture test BLE error:', error);
        }
      };

      setup();
    }

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
      cleanupRef.current?.();
    };
  }, [deviceId, gestureNumber]);

  const handleContinue = () => {
    if (gestureNumber < 3) {
      navigation.replace('GestureTest', {
        deviceId,
        deviceName,
        gestureNumber: gestureNumber + 1,
      });
    } else {
      navigation.replace('Permissions');
    }
  };

  const handleTryAgain = () => {
    setDetected(false);
    setDetectedValue(null);
    navigation.replace('GestureTest', {
      deviceId,
      deviceName,
      gestureNumber,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Gesture time.</Text>
        <Text style={styles.description}>
          Trace the shape of a {gestureNumber} in the air
        </Text>

        <View style={styles.centerArea}>
          <GestureBox
            value={detected ? String(detectedValue) : '-'}
            success={detected}
          />
        </View>

        <Image
          source={require('../../assets/setup/finger.png')}
          style={styles.fingerImage}
          resizeMode="contain"
        />

        {detected && (
          <View style={styles.bottomArea}>
            <View style={styles.buttonRow}>
              <NeumorphicButton
                label="Try Again"
                onPress={handleTryAgain}
                variant="red"
                width={scale(150)}
              />
              <NeumorphicButton
                label="Continue"
                onPress={handleContinue}
                variant="green"
                width={scale(150)}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: scale(20),
    fontFamily: FONTS.mono,
    color: COLORS.black,
    textAlign: 'center',
    marginTop: verticalScale(50),
  },
  description: {
    fontSize: scale(14),
    fontFamily: FONTS.mono,
    color: COLORS.black,
    textAlign: 'center',
    paddingHorizontal: scale(33),
    marginTop: verticalScale(8),
  },
  centerArea: {
    alignItems: 'center',
    marginTop: verticalScale(80),
  },
  fingerImage: {
    width: scale(407),
    height: verticalScale(498),
    position: 'absolute',
    bottom: 0,
    left: scale(-5),
  },
  bottomArea: {
    position: 'absolute',
    bottom: verticalScale(30),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: scale(20),
  },
});
