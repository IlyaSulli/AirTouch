import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, AppState } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { COLORS, FONTS, scale, verticalScale } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { checkAllPermissions, PermissionStatus } from '../services/permissions';
import { openAccessibilitySettings } from '../../modules/accessibility-bridge';
import { requestDndAccess } from '../../modules/shortcut-actions';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

export const PermissionsScreen: React.FC<Props> = ({ navigation }) => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    dndAccess: false,
    accessibilityService: false,
  });

  useEffect(() => {
    checkAllPermissions().then(setPermissions);
  }, []);

  // Re-check when user returns from Android Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkAllPermissions().then(setPermissions);
      }
    });
    return () => subscription.remove();
  }, []);

  const handleEnableAccessibility = async () => {
    await openAccessibilitySettings();
  };

  const handleEnableDnd = async () => {
    await requestDndAccess();
  };

  const handleContinue = () => {
    navigation.replace('SetupDone');
  };

  const allGranted = permissions.accessibilityService && permissions.dndAccess;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Almost there.</Text>
        <Text style={styles.description}>
          These permissions let your ring control your phone.
        </Text>

        <View style={styles.permissionList}>
          {/* Accessibility Service */}
          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Accessibility Service</Text>
              <Text style={styles.permissionDesc}>
                Swipes, quick settings, lock screen
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: permissions.accessibilityService
                        ? COLORS.green
                        : COLORS.red,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: permissions.accessibilityService
                        ? COLORS.green
                        : COLORS.red,
                    },
                  ]}
                >
                  {permissions.accessibilityService ? 'Enabled' : 'Not enabled'}
                </Text>
              </View>
            </View>
            <NeumorphicButton
              label={permissions.accessibilityService ? 'Enabled' : 'Enable'}
              onPress={handleEnableAccessibility}
              variant={permissions.accessibilityService ? 'inset' : 'raised'}
              disabled={permissions.accessibilityService}
              width={scale(130)}
            />
          </View>

          {/* DND Access */}
          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Do Not Disturb</Text>
              <Text style={styles.permissionDesc}>
                Toggle Do Not Disturb mode
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: permissions.dndAccess
                        ? COLORS.green
                        : COLORS.red,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: permissions.dndAccess ? COLORS.green : COLORS.red,
                    },
                  ]}
                >
                  {permissions.dndAccess ? 'Enabled' : 'Not enabled'}
                </Text>
              </View>
            </View>
            <NeumorphicButton
              label={permissions.dndAccess ? 'Enabled' : 'Enable'}
              onPress={handleEnableDnd}
              variant={permissions.dndAccess ? 'inset' : 'raised'}
              disabled={permissions.dndAccess}
              width={scale(130)}
            />
          </View>
        </View>

        <Image
          source={require('../../assets/setup/finger.png')}
          style={styles.fingerImage}
          resizeMode="contain"
        />

        <View style={styles.bottomArea}>
          <NeumorphicButton
            label="Continue"
            onPress={handleContinue}
            variant={allGranted ? 'green' : 'raised'}
          />
        </View>
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
  permissionList: {
    marginTop: verticalScale(40),
    paddingHorizontal: scale(24),
    gap: verticalScale(24),
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionInfo: {
    flex: 1,
    marginRight: scale(12),
  },
  permissionLabel: {
    fontSize: scale(15),
    fontFamily: FONTS.mono,
    color: COLORS.black,
  },
  permissionDesc: {
    fontSize: scale(11),
    fontFamily: FONTS.mono,
    color: COLORS.black,
    opacity: 0.5,
    marginTop: verticalScale(2),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: verticalScale(6),
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: 9999,
  },
  statusText: {
    fontSize: scale(12),
    fontFamily: FONTS.mono,
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
});
