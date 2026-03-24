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

export interface EditCategory {
  label: string;
  iconName: string;
}

export const EDIT_CATEGORIES: EditCategory[] = [
  { label: 'Open App', iconName: 'layout-grid' },
  { label: 'Camera', iconName: 'camera' },
  { label: 'System', iconName: 'sliders-horizontal' },
  { label: 'Interaction', iconName: 'gallery-horizontal-end' },
  { label: 'Multi-Media', iconName: 'music' },
];

interface EditCarouselProps {
  selectedIndex: number;
}

const ICON_SHADOW: ViewStyle['boxShadow'] = [
  { offsetX: 0, offsetY: 0, blurRadius: 4, spreadDistance: 0, color: 'rgba(124,124,124,0.50)' },
];

const DOT_SIZE = scale(7);
const DOT_GAP = scale(7);
const SLIDE_DISTANCE = scale(100);
const ANIM_DURATION = 500;

export const EditCarousel: React.FC<EditCarouselProps> = ({ selectedIndex }) => {
  const { colors } = useTheme();
  const category = EDIT_CATEGORIES[selectedIndex];

  // Track previous index to determine swipe direction
  const prevIndex = React.useRef(selectedIndex);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const [displayIndex, setDisplayIndex] = React.useState(selectedIndex);

  useEffect(() => {
    if (selectedIndex === prevIndex.current) return;

    const direction = selectedIndex > prevIndex.current ? 1 : -1;
    prevIndex.current = selectedIndex;

    // Fade + slide out
    opacity.value = withTiming(0, {
      duration: ANIM_DURATION / 2,
      easing: Easing.out(Easing.ease),
    });
    translateX.value = withTiming(-direction * SLIDE_DISTANCE, {
      duration: ANIM_DURATION / 2,
      easing: Easing.out(Easing.ease),
    }, () => {
      // Snap to entry position on the other side
      translateX.value = direction * SLIDE_DISTANCE;
      runOnJS(setDisplayIndex)(selectedIndex);
      // Fade + slide in
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

  const displayCategory = EDIT_CATEGORIES[displayIndex];

  return (
    <View style={styles.container}>
      {/* Icon + label area with swipe animation */}
      <Animated.View style={[styles.contentArea, animatedStyle]}>
        <View style={styles.iconContainer}>
          <LucideIcon
            name={displayCategory.iconName}
            size={scale(50)}
            color={colors.black}
            strokeWidth={1.8}
          />
        </View>
        <Text style={[styles.categoryLabel, { color: colors.black, textShadowColor: colors.textShadow }]}>{displayCategory.label}</Text>
      </Animated.View>

      {/* Dot indicators */}
      <View style={styles.dotRow}>
        {EDIT_CATEGORIES.map((_, index) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
    marginTop: verticalScale(-10),
  },
  categoryLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: scale(24),
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
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
});
