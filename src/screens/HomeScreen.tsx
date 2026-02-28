import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useSharedValue } from 'react-native-reanimated';
import { scale, verticalScale } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { useBleGestureListener } from '../hooks/useBleGestureListener';
import { RootStackParamList } from '../navigation/types';
import { GestureShortcut, ShortcutAction, DEFAULT_SHORTCUTS } from '../types/shortcuts';
import {
  getShortcuts,
  storeShortcuts,
  clearStoredDevice,
  getStoredDevice,
  ThemeMode,
} from '../services/storage';
import { VirtualScreenCard } from '../components/home/VirtualScreenCard';
import { GestureToggle } from '../components/home/GestureToggle';
import { AnimatedIconButton } from '../components/home/AnimatedIconButton';
import { AirWatermark } from '../components/home/AirWatermark';
import { NoiseLayer } from '../components/home/BackgroundEffects';
import { EDIT_CATEGORIES } from '../components/home/EditCarousel';
import { SHORTCUT_CATALOG } from '../types/shortcuts';
import { THEME_OPTIONS, SETTINGS_LABELS } from '../components/home/SettingsContent';
import { getInstalledApps, InstalledApp } from '../../modules/installed-apps';
import {
  checkAllPermissions,
  checkPermissionsForAction,
  requestPermissionsForAction,
  requiresAccessibilityService,
  requiresDndAccess,
  PermissionStatus,
} from '../services/permissions';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, mode: currentTheme, setThemeMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shortcuts, setShortcuts] = useState<GestureShortcut[]>(DEFAULT_SHORTCUTS);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryIndex, setEditCategoryIndex] = useState(0);
  const [isSubMenuActive, setIsSubMenuActive] = useState(false);
  const [subActionIndex, setSubActionIndex] = useState(0);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);

  // Settings mode state
  const [isSettingsMode, setIsSettingsMode] = useState(false);
  const [settingsIndex, setSettingsIndex] = useState(0); // 0=PREVIEW, 1=THEME, 2=CONNECT
  const [isSettingsEditing, setIsSettingsEditing] = useState(false);
  const [settingsEditIndex, setSettingsEditIndex] = useState(0);
  // BLE gesture listener — connects to Arduino and executes shortcuts
  const {
    detectedGesture,
    isConnected,
    connectedDeviceName: bleDeviceName,
  } = useBleGestureListener();
  const [storedDeviceName, setStoredDeviceName] = useState<string | null>(null);
  const connectedDeviceName = bleDeviceName ?? storedDeviceName;

  // Permission status tracking
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    dndAccess: false,
    accessibilityService: false,
  });

  // Periodic tick to refresh relative timestamps
  const [, setTick] = useState(0);

  // Easter egg: shake to scatter AIR watermark letters
  const shakeTrigger = useSharedValue(0);

  const handleShake = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    shakeTrigger.value = shakeTrigger.value + 1;
  }, [shakeTrigger]);

  const handleShakeTick = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  useShakeDetection({ onShake: handleShake, onShakeTick: handleShakeTick });

  useEffect(() => {
    const load = async () => {
      const [stored, device] = await Promise.all([
        getShortcuts(),
        getStoredDevice(),
      ]);
      setShortcuts(stored);
      if (device) {
        setStoredDeviceName(device.name);
      }
    };
    load();
  }, []);

  // Check permissions on mount and when app returns to foreground
  useEffect(() => {
    checkAllPermissions().then(setPermissionStatus);

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkAllPermissions().then(setPermissionStatus);
      }
    });
    return () => subscription.remove();
  }, []);

  // Load installed apps from the native module
  useEffect(() => {
    const loadApps = async () => {
      try {
        const apps = await getInstalledApps();
        setInstalledApps(apps);
      } catch (e) {
        console.warn('Failed to load installed apps:', e);
      }
    };
    loadApps();
  }, []);

  // Reload shortcuts when a gesture fires (to pick up lastUsed timestamp updates)
  useEffect(() => {
    if (detectedGesture !== null) {
      const timer = setTimeout(() => {
        getShortcuts().then(setShortcuts);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [detectedGesture]);

  // Periodic re-render to keep relative timestamps fresh
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = useCallback(async (value: boolean) => {
    if (value) {
      // Enabling — check if the action requires a missing permission
      const action = shortcuts[currentIndex].action;
      if (action) {
        const hasPermission = await checkPermissionsForAction(action);
        if (!hasPermission) {
          // Open the relevant settings screen; don't toggle on
          await requestPermissionsForAction(action);
          return;
        }
      }
    }
    const updated = shortcuts.map((s, i) =>
      i === currentIndex ? { ...s, isActive: value } : s
    );
    setShortcuts(updated);
    await storeShortcuts(updated);
  }, [shortcuts, currentIndex]);

  const subActions = isEditing ? (SHORTCUT_CATALOG[editCategoryIndex]?.actions ?? []) : [];
  const isOpenApp = isEditing && isSubMenuActive && editCategoryIndex === 0;
  const currentSubMenuLength = isOpenApp
    ? installedApps.length
    : subActions.length;

  // ─── Navigation boundary logic ──────────────────────────────────────────────
  const isAtStart = isSettingsMode
    ? (isSettingsEditing ? settingsEditIndex === 0 : settingsIndex === 0)
    : isEditing
      ? (isSubMenuActive ? subActionIndex === 0 : editCategoryIndex === 0)
      : currentIndex === 0;

  const isAtEnd = isSettingsMode
    ? (isSettingsEditing
      ? settingsEditIndex === THEME_OPTIONS.length - 1
      : settingsIndex === SETTINGS_LABELS.length - 1)
    : isEditing
      ? (isSubMenuActive
        ? subActionIndex === currentSubMenuLength - 1
        : editCategoryIndex === EDIT_CATEGORIES.length - 1)
      : currentIndex === 2;

  // ─── Previous / Next handlers ───────────────────────────────────────────────
  const handlePrevious = useCallback(() => {
    if (isSettingsMode) {
      if (isSettingsEditing) {
        setSettingsEditIndex(prev => Math.max(0, prev - 1));
      } else {
        setSettingsIndex(prev => Math.max(0, prev - 1));
      }
      return;
    }
    if (isEditing) {
      if (isSubMenuActive) {
        setSubActionIndex(prev => Math.max(0, prev - 1));
      } else {
        setEditCategoryIndex(prev => Math.max(0, prev - 1));
      }
    } else {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  }, [isSettingsMode, isSettingsEditing, isEditing, isSubMenuActive]);

  const handleNext = useCallback(() => {
    if (isSettingsMode) {
      if (isSettingsEditing) {
        setSettingsEditIndex(prev => Math.min(THEME_OPTIONS.length - 1, prev + 1));
      } else {
        setSettingsIndex(prev => Math.min(SETTINGS_LABELS.length - 1, prev + 1));
      }
      return;
    }
    if (isEditing) {
      if (isSubMenuActive) {
        setSubActionIndex(prev => Math.min(currentSubMenuLength - 1, prev + 1));
      } else {
        setEditCategoryIndex(prev => Math.min(EDIT_CATEGORIES.length - 1, prev + 1));
      }
    } else {
      setCurrentIndex(prev => Math.min(2, prev + 1));
    }
  }, [isSettingsMode, isSettingsEditing, isEditing, isSubMenuActive, currentSubMenuLength]);

  // ─── Edit / Select handler ──────────────────────────────────────────────────
  const handleEditPress = useCallback(async () => {
    if (isSettingsMode) {
      // THEME tab (index 1)
      if (settingsIndex === 1) {
        if (isSettingsEditing) {
          // "Select" pressed – save selected theme
          const selectedTheme = THEME_OPTIONS[settingsEditIndex].mode;
          await setThemeMode(selectedTheme);
          setIsSettingsEditing(false);
        } else {
          // Enter theme edit carousel
          const currentIdx = THEME_OPTIONS.findIndex(o => o.mode === currentTheme);
          setSettingsEditIndex(currentIdx >= 0 ? currentIdx : 0);
          setIsSettingsEditing(true);
        }
      }
      // CONNECT tab (index 2) – Edit goes back to onboarding
      if (settingsIndex === 2) {
        await clearStoredDevice();
        navigation.replace('Search');
      }
      // PREVIEW tab (index 0) – no edit action
      return;
    }
    if (isEditing) {
      if (isSubMenuActive) {
        // Build ShortcutAction from current selection and save
        let newAction: ShortcutAction;

        if (editCategoryIndex === 0) {
          // "Open App" — use the selected installed app
          const selectedApp = installedApps[subActionIndex];
          if (!selectedApp) return;
          newAction = {
            category: 'app',
            label: selectedApp.label,
            actionType: 'Open Application',
            iconName: 'layout-grid',
            appName: selectedApp.label,
            packageName: selectedApp.packageName,
          };
        } else {
          // Other categories — use action from catalog
          const catalogAction = SHORTCUT_CATALOG[editCategoryIndex]?.actions[subActionIndex];
          if (!catalogAction) return;
          newAction = {
            category: SHORTCUT_CATALOG[editCategoryIndex].category,
            label: catalogAction.label,
            actionType: catalogAction.actionType,
            iconName: catalogAction.iconName,
          };
        }

        // Auto-disable if required permission is not granted
        const hasPermission = await checkPermissionsForAction(newAction);
        const updated = shortcuts.map((s, i) =>
          i === currentIndex
            ? { ...s, action: newAction, lastUsed: null, isActive: hasPermission ? s.isActive : false }
            : s
        );
        setShortcuts(updated);
        await storeShortcuts(updated);
        checkAllPermissions().then(setPermissionStatus);

        setIsSubMenuActive(false);
        setSubActionIndex(0);
        setIsEditing(false);
        return;
      }
      // Enter sub-menu for the selected category
      setSubActionIndex(0);
      setIsSubMenuActive(true);
      return;
    }
    setEditCategoryIndex(0);
    setIsEditing(true);
  }, [isSettingsMode, settingsIndex, isSettingsEditing, settingsEditIndex,
      currentTheme, isEditing, isSubMenuActive, editCategoryIndex, navigation,
      shortcuts, currentIndex, subActionIndex, installedApps, setThemeMode]);

  // ─── Back handler ───────────────────────────────────────────────────────────
  const handleBackPress = useCallback(() => {
    if (isSettingsMode) {
      if (isSettingsEditing) {
        // Exit theme edit carousel
        setIsSettingsEditing(false);
      } else {
        // Exit settings mode entirely
        setIsSettingsMode(false);
        setSettingsIndex(0);
      }
      return;
    }
    if (isEditing) {
      if (isSubMenuActive) {
        setIsSubMenuActive(false);
        setSubActionIndex(0);
      } else {
        setIsEditing(false);
      }
    }
  }, [isSettingsMode, isSettingsEditing, isEditing, isSubMenuActive]);

  // ─── Settings toggle ───────────────────────────────────────────────────────
  const handleSettingsToggle = useCallback(() => {
    if (isSettingsMode) {
      // Exit settings mode
      setIsSettingsMode(false);
      setIsSettingsEditing(false);
      setSettingsIndex(0);
    } else {
      // Enter settings mode, exit any shortcut editing first
      setIsEditing(false);
      setIsSubMenuActive(false);
      setIsSettingsMode(true);
      setSettingsIndex(0);
      setIsSettingsEditing(false);
    }
  }, [isSettingsMode]);

  // ─── Determine button labels and icons ──────────────────────────────────────
  const getEditButtonLabel = (): string => {
    if (isSettingsMode) {
      if (settingsIndex === 0) return 'Edit'; // Preview – no real action
      if (settingsIndex === 1) return isSettingsEditing ? 'Select' : 'Edit';
      if (settingsIndex === 2) return 'Edit';
    }
    if (isEditing) return 'Select';
    return 'Edit';
  };

  const getEditButtonIcon = (): string => {
    if (isSettingsMode) {
      if (isSettingsEditing) return '';
      return 'pen';
    }
    if (isEditing) return '';
    return 'pen';
  };

  // In settings mode, Preview tab: lock the edit button
  const isEditLocked = isSettingsMode && settingsIndex === 0 && !isSettingsEditing;

  // Check if current shortcut's action requires a missing permission
  const currentAction = shortcuts[currentIndex].action;
  const permissionMissing = currentAction
    ? (requiresAccessibilityService(currentAction) && !permissionStatus.accessibilityService)
      || (requiresDndAccess(currentAction) && !permissionStatus.dndAccess)
    : false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>
        {/* Noise texture (plastic backing) */}
        <NoiseLayer />

        {/* AIR watermark behind content */}
        <View style={styles.watermarkContainer}>
          <AirWatermark shakeTrigger={shakeTrigger} />
        </View>

        {/* Virtual screen card */}
        <View style={styles.cardContainer}>
          <VirtualScreenCard
            currentIndex={currentIndex}
            shortcut={shortcuts[currentIndex]}
            isGestureActive={shortcuts[currentIndex].isActive}
            isEditing={isEditing}
            editCategoryIndex={editCategoryIndex}
            isSubMenuActive={isSubMenuActive}
            subActionIndex={subActionIndex}
            installedApps={installedApps}
            isSettingsMode={isSettingsMode}
            settingsIndex={settingsIndex}
            currentTheme={currentTheme}
            isSettingsEditing={isSettingsEditing}
            settingsEditIndex={settingsEditIndex}
            detectedGesture={detectedGesture}
            connectedDeviceName={connectedDeviceName}
            isConnected={isConnected}
            permissionMissing={permissionMissing}
          />
        </View>

        {/* Gesture toggle + settings */}
        <GestureToggle
          isActive={shortcuts[currentIndex].isActive}
          onToggle={handleToggle}
          onSettingsPress={handleSettingsToggle}
          onBackPress={handleBackPress}
          disabled={isEditing || isSettingsMode}
          backLocked={!isEditing && !isSettingsMode && !isSettingsEditing}
          isSettingsMode={isSettingsMode}
        />

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Bottom navigation buttons */}
        <View style={styles.bottomNav}>
          <AnimatedIconButton
            iconName={'arrow-big-left-dash'}
            label="Previous"
            onPress={handlePrevious}
            variant="raised"
            locked={isAtStart}
            holdable={isOpenApp}
          />
          <AnimatedIconButton
            iconName={getEditButtonIcon()}
            label={getEditButtonLabel()}
            onPress={handleEditPress}
            variant="blue"
            locked={isEditLocked}
          />
          <AnimatedIconButton
            iconName={'arrow-big-right-dash'}
            label="Next"
            onPress={handleNext}
            variant="raised"
            locked={isAtEnd}
            holdable={isOpenApp}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: verticalScale(180),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cardContainer: {
    marginTop: verticalScale(26),
    paddingHorizontal: scale(21),
  },
  spacer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: scale(21),
    paddingBottom: verticalScale(30),
  },
});
