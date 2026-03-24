import React, { useRef, useEffect, memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { FONTS, scale, verticalScale } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { LucideIcon } from './LucideIcon';
import type { InstalledApp } from '../../../modules/installed-apps';

// ─── Layout constants ─────────────────────────────────────────────────────────
const ROW_HEIGHT = scale(32);
const ICON_SIZE = scale(24);
const ICON_RADIUS = scale(5);
const ARROW_WIDTH = scale(22);
const FADE_HEIGHT = verticalScale(28);
const HORIZONTAL_PADDING = scale(20);
const ANIM_DURATION_NORMAL = 500;
const ANIM_DURATION_MIN = 60;       // fast enough for 50ms hold ticks
const ANIM_EASING = Easing.out(Easing.cubic);

// ─── Props ────────────────────────────────────────────────────────────────────
interface AppListCarouselProps {
  selectedIndex: number;
  apps: InstalledApp[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export const AppListCarousel: React.FC<AppListCarouselProps> = ({
  selectedIndex,
  apps,
}) => {
  const { colors } = useTheme();
  const listHeight = useRef(0);
  const lastChangeTime = useRef(Date.now());

  // Arrow vertical position (within content)
  const arrowY = useSharedValue(selectedIndex * ROW_HEIGHT);
  // Content scroll offset
  const contentTranslateY = useSharedValue(0);

  const isAtTop = selectedIndex === 0;
  const isAtBottom = selectedIndex === apps.length - 1;

  // Adaptive animation duration (ref, no re-render)
  const animDurationRef = useRef(ANIM_DURATION_NORMAL);

  // Virtualization window size
  const BUFFER = 4; // rows above/below
  const visibleCountRef = useRef(12);

  // Arrow only moves vertically
  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowY.value }],
  }));

  // Content slides up/down so the selected item stays centred
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  useEffect(() => {
    // Compute adaptive duration
    const now = Date.now();
    const elapsed = now - lastChangeTime.current;
    let duration = Math.max(ANIM_DURATION_MIN, Math.min(ANIM_DURATION_NORMAL, elapsed * 0.8));
    if (elapsed > ANIM_DURATION_NORMAL * 1.5) duration = ANIM_DURATION_NORMAL;
    lastChangeTime.current = now;
    animDurationRef.current = duration;

    const timingConfig = { duration, easing: ANIM_EASING };

    // Animate arrow to new row
    arrowY.value = withTiming(selectedIndex * ROW_HEIGHT, timingConfig);

    // Animate content so selected row is vertically centred
    const targetOffset =
      -(selectedIndex * ROW_HEIGHT - listHeight.current / 2 + ROW_HEIGHT / 2);
    const maxOffset = 0;
    const totalContentHeight = apps.length * ROW_HEIGHT + verticalScale(8);
    const minOffset = -(totalContentHeight - listHeight.current);

    const clampedOffset = Math.min(
      maxOffset,
      Math.max(totalContentHeight > listHeight.current ? minOffset : 0, targetOffset),
    );

    contentTranslateY.value = withTiming(clampedOffset, timingConfig);
  }, [selectedIndex, apps.length]);

  // Calculate virtualization window
  const vc = visibleCountRef.current;
  const start = Math.max(0, selectedIndex - Math.floor(vc / 2) - BUFFER);
  const end = Math.min(apps.length, selectedIndex + Math.ceil(vc / 2) + BUFFER);

  // Blank space above and below
  const topBlank = start * ROW_HEIGHT;
  const bottomBlank = (apps.length - end) * ROW_HEIGHT;

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Open App</Text>

      {/* Scrollable list area */}
      <View
        style={styles.listWrapper}
        onLayout={(e) => {
          listHeight.current = e.nativeEvent.layout.height;
          visibleCountRef.current = Math.ceil(e.nativeEvent.layout.height / ROW_HEIGHT) + 2 * BUFFER;
        }}
      >
        <Animated.View style={[styles.scrollContent, contentAnimatedStyle]}>
          {topBlank > 0 && <View style={{ height: topBlank }} />}
          {apps.slice(start, end).map((app, i) => {
            const index = start + i;
            return (
              <AppRow
                key={app.packageName}
                app={app}
                isSelected={index === selectedIndex}
                animDuration={animDurationRef.current}
              />
            );
          })}
          {bottomBlank > 0 && <View style={{ height: bottomBlank }} />}

          {/* ── Floating arrow – smoothly glides between rows ── */}
          <Animated.View
            style={[styles.floatingArrow, arrowAnimatedStyle]}
            pointerEvents="none"
          >
            <LucideIcon
              name="arrow-right"
              size={scale(18)}
              color={colors.black}
              strokeWidth={3}
            />
          </Animated.View>
        </Animated.View>

        {/* ── Top fade gradient (hidden when at first item) ── */}
        {!isAtTop && (
          <View style={styles.fadeTop} pointerEvents="none">
            <Svg width="100%" height={FADE_HEIGHT}>
              <Defs>
                <SvgLinearGradient id="appFadeTop" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.screenBg} stopOpacity="1" />
                  <Stop offset="1" stopColor={colors.screenBg} stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height={FADE_HEIGHT}
                fill="url(#appFadeTop)"
              />
            </Svg>
          </View>
        )}

        {/* ── Bottom fade gradient (hidden when at last item) ── */}
        {!isAtBottom && (
          <View style={styles.fadeBottom} pointerEvents="none">
            <Svg width="100%" height={FADE_HEIGHT}>
              <Defs>
                <SvgLinearGradient
                  id="appFadeBottom"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop offset="0" stopColor={colors.screenBg} stopOpacity="0" />
                  <Stop offset="1" stopColor={colors.screenBg} stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height={FADE_HEIGHT}
                fill="url(#appFadeBottom)"
              />
            </Svg>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Animated row (smooth horizontal slide, memoized) ───────────────────────
const AppRow = memo(
  ({ app, isSelected, animDuration }: { app: InstalledApp; isSelected: boolean; animDuration: number }) => {
    const { colors } = useTheme();
    const translateX = useSharedValue(isSelected ? scale(16) : 0);

    useEffect(() => {
      translateX.value = withTiming(isSelected ? scale(16) : 0, {
        duration: animDuration,
        easing: ANIM_EASING,
      });
    }, [isSelected, animDuration]);

    const rowAnimStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    return (
      <Animated.View style={[styles.row, rowAnimStyle]}>
        {/* Empty arrow slot – keeps row layout consistent */}
        <View style={styles.arrowSlot} />

        {/* App icon */}
        {app.icon ? (
          <Image
            source={{ uri: `data:image/png;base64,${app.icon}` }}
            style={styles.iconImage}
          />
        ) : (
          <View style={styles.iconFallback} />
        )}

        {/* App name */}
        <Text
          style={[styles.appName, { color: colors.black }, isSelected && styles.appNameSelected]}
          numberOfLines={1}
        >
          {app.label}
        </Text>
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.app.packageName === next.app.packageName &&
    prev.animDuration === next.animDuration
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.mono,
    fontSize: scale(11),
    color: '#999999',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: scale(2),
    paddingTop: verticalScale(2),
    paddingBottom: verticalScale(4),
  },
  listWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: verticalScale(4),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    paddingLeft: HORIZONTAL_PADDING,
  },

  arrowSlot: {
    width: ARROW_WIDTH,
    marginRight: scale(10),
  },
  floatingArrow: {
    position: 'absolute',
    top: verticalScale(4), // matches scrollContent paddingVertical
    left: HORIZONTAL_PADDING + scale(16), // row padding + selected row shift
    width: ARROW_WIDTH,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    marginRight: scale(15),
  },
  iconFallback: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    backgroundColor: '#CCCCCC',
    marginRight: scale(10),
  },
  appName: {
    fontFamily: FONTS.mono,
    fontSize: scale(14),
    flex: 1,
  },
  appNameSelected: {
    fontFamily: FONTS.monoBold,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: FADE_HEIGHT,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FADE_HEIGHT,
  },
});
