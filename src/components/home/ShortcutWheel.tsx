import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { FONTS, scale } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { GESTURE_LABELS } from '../../types/shortcuts';

const FADE_STEPS = [1, 0.8, 0.6, 0.4, 0.2, 0];

const FadeEdge: React.FC<{ side: 'left' | 'right'; fadeColor: string }> = ({ side, fadeColor }) => (
  <View
    style={[
      styles.fadeEdge,
      side === 'left' ? styles.fadeLeft : styles.fadeRight,
    ]}
    pointerEvents="none"
  >
    {FADE_STEPS.map((opacity, i) => (
      <View
        key={i}
        style={[
          styles.fadeStep,
          {
            backgroundColor: fadeColor,
            opacity: side === 'left' ? opacity : FADE_STEPS[FADE_STEPS.length - 1 - i],
          },
        ]}
      />
    ))}
  </View>
);

interface ShortcutWheelProps {
  currentIndex: number;
  labels?: readonly string[];
}

const WHEEL_HEIGHT = scale(27);
const DOT_SIZE = scale(4);
const GAP = scale(4);
const PADDING_HORIZONTAL = scale(8);
const VIEWPORT_WIDTH = scale(150);

export const ShortcutWheel: React.FC<ShortcutWheelProps> = ({ currentIndex, labels }) => {
  const { colors } = useTheme();
  const items = labels ?? GESTURE_LABELS;
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const translateX = useSharedValue(0);

  // Calculate cumulative positions based on measured widths
  const calculatePosition = (index: number): number => {
    if (itemWidths.length === 0) return 0;
    let position = 0;
    for (let i = 0; i < index; i++) {
      position += itemWidths[i] + GAP + DOT_SIZE;
    }
    return position;
  };

  React.useEffect(() => {
    if (itemWidths.length === 0) return;
    const centerOffset = VIEWPORT_WIDTH / 2;
    const itemWidth = itemWidths[currentIndex] || 0;
    const itemStart = calculatePosition(currentIndex);
    const itemCenter = itemStart + itemWidth / 2;
    const target = centerOffset - itemCenter;
    translateX.value = withSpring(target, { damping: 60, stiffness: 500 });
  }, [currentIndex, itemWidths, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleLabelLayout = (index: number, width: number) => {
    setItemWidths(prev => {
      const updated = [...prev];
      updated[index] = width;
      return updated;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        <Animated.View style={[styles.track, animatedStyle]}>
          {items.map((label, index) => (
            <React.Fragment key={label}>
              {index > 0 && (
                <View style={styles.dotWrapper}>
                  <View style={[styles.dot, { backgroundColor: colors.black }]} />
                </View>
              )}
              <Text
                onLayout={e => handleLabelLayout(index, e.nativeEvent.layout.width)}
                style={[
                  styles.label,
                  index === currentIndex
                    ? [styles.labelActive, { color: colors.black }]
                    : [styles.labelInactive, { color: colors.black }],
                ]}
              >
                {label}
              </Text>
            </React.Fragment>
          ))}
        </Animated.View>
        <FadeEdge side="left" fadeColor={colors.wheelFade} />
        <FadeEdge side="right" fadeColor={colors.wheelFade} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: WHEEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewport: {
    width: VIEWPORT_WIDTH,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: scale(15),
    fontFamily: FONTS.mono,
    textAlign: 'center',
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  labelActive: {
    fontFamily: FONTS.monoBold,
    fontWeight: '700',
  },
  labelInactive: {
    fontWeight: '500',
  },
  dotWrapper: {
    width: GAP + DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 9999,
  },
  fadeEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '25%',
    flexDirection: 'row',
  },
  fadeLeft: {
    left: 0,
  },
  fadeRight: {
    right: 0,
  },
  fadeStep: {
    flex: 1,
  },
});
