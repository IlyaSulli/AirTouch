import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { FONTS, scale, verticalScale } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { LucideIcon } from './LucideIcon';
import type { ThemeMode } from '../../services/storage';

// ─── Settings labels for the wheel ────────────────────────────────────────────
export const SETTINGS_LABELS = ['PREVIEW', 'THEME', 'CONNECT'] as const;
export type SettingsTab = typeof SETTINGS_LABELS[number];

// ─── Theme options ────────────────────────────────────────────────────────────
export interface ThemeOption {
  label: string;
  iconName: string;
  mode: ThemeMode;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { label: 'Light Mode', iconName: 'sun', mode: 'light' },
  { label: 'Dark Mode', iconName: 'moon', mode: 'dark' },
  { label: 'System', iconName: 'sun-moon', mode: 'system' },
];

// ─── Shared animation constants ──────────────────────────────────────────────
const SLIDE_DISTANCE = scale(100);
const ANIM_DURATION = 500;
const DOT_SIZE = scale(7);
const DOT_GAP = scale(7);

// ─── Theme View (read-only) ──────────────────────────────────────────────────
interface ThemeViewProps {
  currentTheme: ThemeMode;
}

export const ThemeView: React.FC<ThemeViewProps> = ({ currentTheme }) => {
  const { colors } = useTheme();
  const option = THEME_OPTIONS.find(o => o.mode === currentTheme) ?? THEME_OPTIONS[0];

  return (
    <View style={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <LucideIcon
          name={option.iconName}
          size={scale(50)}
          color={colors.black}
          strokeWidth={2}
        />
      </View>
      <Text style={[styles.mainLabel, { color: colors.black, textShadowColor: colors.textShadow }]}>{option.label}</Text>
    </View>
  );
};

// ─── Theme Edit Carousel ─────────────────────────────────────────────────────
interface ThemeEditCarouselProps {
  selectedIndex: number;
}

export const ThemeEditCarousel: React.FC<ThemeEditCarouselProps> = ({ selectedIndex }) => {
  const { colors } = useTheme();
  const prevIndex = React.useRef(selectedIndex);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const [displayIndex, setDisplayIndex] = React.useState(selectedIndex);

  useEffect(() => {
    if (selectedIndex === prevIndex.current) return;
    const direction = selectedIndex > prevIndex.current ? 1 : -1;
    prevIndex.current = selectedIndex;

    opacity.value = withTiming(0, {
      duration: ANIM_DURATION / 2,
      easing: Easing.out(Easing.ease),
    });
    translateX.value = withTiming(-direction * SLIDE_DISTANCE, {
      duration: ANIM_DURATION / 2,
      easing: Easing.out(Easing.ease),
    }, () => {
      translateX.value = direction * SLIDE_DISTANCE;
      runOnJS(setDisplayIndex)(selectedIndex);
      opacity.value = withTiming(1, {
        duration: ANIM_DURATION / 2,
        easing: Easing.in(Easing.ease),
      });
      translateX.value = withTiming(0, {
        duration: ANIM_DURATION / 2,
        easing: Easing.in(Easing.ease),
      });
    });
  }, [selectedIndex, opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const displayOption = THEME_OPTIONS[displayIndex];

  return (
    <View style={styles.carouselContainer}>
      <Animated.View style={[styles.carouselContent, animatedStyle]}>
        <View style={styles.iconContainer}>
          <LucideIcon
            name={displayOption.iconName}
            size={scale(50)}
            color={colors.black}
            strokeWidth={1.8}
          />
        </View>
        <Text style={[styles.mainLabel, { color: colors.black, textShadowColor: colors.textShadow }]}>{displayOption.label}</Text>
      </Animated.View>

      {/* Dot indicators */}
      <View style={styles.dotRow}>
        {THEME_OPTIONS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === selectedIndex ? colors.black : colors.dotInactive,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Preview View ─────────────────────────────────────────────────────────────
interface PreviewViewProps {
  detectedGesture: number | null;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ detectedGesture }) => {
  const { colors } = useTheme();
  const displayValue = detectedGesture != null && detectedGesture >= 1 && detectedGesture <= 3
    ? String(detectedGesture)
    : '-';

  return (
    <View style={styles.contentContainer}>
      <Text style={[styles.detectedLabel, { color: colors.black, textShadowColor: colors.textShadowLight }]}>Detected Number</Text>
      <Text style={[
        styles.detectedNumber,
        { color: displayValue === '-' ? colors.black : colors.accentBlue, textShadowColor: colors.textShadowLight },
      ]}>
        {displayValue}
      </Text>
    </View>
  );
};

// ─── Connect View ─────────────────────────────────────────────────────────────
interface ConnectViewProps {
  deviceName: string | null;
}

export const ConnectView: React.FC<ConnectViewProps> = ({ deviceName }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.contentContainer}>
      <Text style={[styles.connectedToLabel, { color: colors.black, textShadowColor: colors.textShadowLight }]}>Connected to</Text>
      <Text style={[styles.deviceName, { color: colors.accentBlue, textShadowColor: colors.textShadowLight }]}>{deviceName ?? 'No device'}</Text>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(-26),
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  mainLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: scale(24),
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  // Theme Edit Carousel
  carouselContainer: {
    flex: 1,
  },
  carouselContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DOT_GAP,
    paddingBottom: verticalScale(20),
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 9999,
  },
  // Preview
  detectedLabel: {
    fontFamily: FONTS.mono,
    fontSize: scale(15),
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    marginBottom: verticalScale(4),
  },
  detectedNumber: {
    fontFamily: FONTS.mono,
    fontSize: scale(96),
    textAlign: 'center',
    textShadowColor: 'rgba(135,135,135,0.25)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    lineHeight: scale(110),
  },
  // Connect
  connectedToLabel: {
    fontFamily: FONTS.mono,
    fontSize: scale(15),
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    marginBottom: verticalScale(8),
  },
  deviceName: {
    fontFamily: FONTS.monoBold,
    fontSize: scale(20),
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
