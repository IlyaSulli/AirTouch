import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { SHORTCUT_CATALOG } from '../../types/shortcuts';

interface SubActionCarouselProps {
  /** Index into SHORTCUT_CATALOG (skipping 0 = Open App) */
  categoryIndex: number;
  /** Index of the currently-highlighted action within the category */
  selectedIndex: number;
}

const DOT_SIZE = scale(7);
const DOT_GAP = scale(7);
const SLIDE_DISTANCE = scale(100);
const ANIM_DURATION = 500;

export const SubActionCarousel: React.FC<SubActionCarouselProps> = ({
  categoryIndex,
  selectedIndex,
}) => {
  const catalog = SHORTCUT_CATALOG[categoryIndex];
  const actions = catalog?.actions ?? [];
  const { colors } = useTheme();

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

  const displayAction = actions[displayIndex];

  if (!displayAction) return null;

  return (
    <View style={styles.container}>
      {/* Category title */}
      <Text style={styles.categoryTitle}>{catalog.label}</Text>

      {/* Icon + label area with swipe animation */}
      <Animated.View style={[styles.contentArea, animatedStyle]}>
        <View style={styles.iconContainer}>
          <LucideIcon
            name={displayAction.iconName}
            size={scale(50)}
            color={colors.black}
            strokeWidth={1.8}
          />
        </View>
        <Text style={[styles.actionLabel, { color: colors.black, textShadowColor: colors.textShadow }]}>{displayAction.label}</Text>
      </Animated.View>

      {/* Dot indicators */}
      <View style={styles.dotRow}>
        {actions.map((_, index) => (
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
  categoryTitle: {
    fontFamily: FONTS.mono,
    fontSize: scale(11),
    color: '#999999',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: scale(2),
    paddingTop: verticalScale(4),
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
  actionLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: scale(20),
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
