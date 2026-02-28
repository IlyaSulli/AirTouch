import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FONTS, scale } from '../../constants/theme';
import type { ColorPalette } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { LucideIcon } from './LucideIcon';

type ButtonVariant = 'raised' | 'blue';

interface AnimatedIconButtonProps {
  iconName: string;
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: number;
  disabled?: boolean;
  locked?: boolean; // kept in depressed state (e.g. at list boundary)
  holdable?: boolean; // when true, holding fires onPress at accelerating rate
}

// --- Shadow definitions - built from theme colors ---

function buildShadows(c: ColorPalette) {
  const RAISED_WHITE_OUTER: ViewStyle['boxShadow'] = [
    { offsetX: 2, offsetY: 2, blurRadius: 5, spreadDistance: 0, color: c.raisedWhiteOuterDark },
    { offsetX: -2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: c.raisedWhiteOuterLight },
    { offsetX: 2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: c.raisedWhiteOuterEdge },
    { offsetX: -2, offsetY: 2, blurRadius: 4, spreadDistance: 0, color: c.raisedWhiteOuterEdge },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.raisedWhiteOuterInsetDark, inset: true },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.raisedWhiteOuterInsetLight, inset: true },
  ];

  const RAISED_WHITE_INNER: ViewStyle['boxShadow'] = [
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: c.raisedWhiteInnerDark, inset: true },
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.raisedWhiteInnerLight, inset: true },
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.raisedWhiteInnerEdge, inset: true },
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: c.raisedWhiteInnerEdge, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.raisedWhiteInnerRim },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.raisedWhiteInnerGlow },
  ];

  const DEPRESSED_WHITE_OUTER: ViewStyle['boxShadow'] = [
    { offsetX: 2, offsetY: 2, blurRadius: 5, spreadDistance: 0, color: c.depressedBtnOuterDark, inset: true },
    { offsetX: -2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: c.depressedBtnOuterLight, inset: true },
    { offsetX: 2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: c.depressedBtnOuterEdge, inset: true },
    { offsetX: -2, offsetY: 2, blurRadius: 4, spreadDistance: 0, color: c.depressedBtnOuterEdge, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.depressedBtnOuterRim },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.depressedBtnOuterGlow },
  ];

  const DEPRESSED_WHITE_INNER: ViewStyle['boxShadow'] = [
    { offsetX: 1, offsetY: 1, blurRadius: 3, spreadDistance: 0, color: c.depressedBtnInnerDark, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.depressedBtnInnerLight, inset: true },
    { offsetX: 1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.depressedBtnInnerEdge, inset: true },
    { offsetX: -1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.depressedBtnInnerEdge, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.depressedBtnInnerRim },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.depressedBtnInnerGlow },
  ];

  const RAISED_BLUE_OUTER: ViewStyle['boxShadow'] = [
    { offsetX: 2, offsetY: 2, blurRadius: 5, spreadDistance: 0, color: c.blueShadowDark },
    { offsetX: -2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: c.blueShadowLight },
    { offsetX: 2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: c.blueShadow1 },
    { offsetX: -2, offsetY: 2, blurRadius: 4, spreadDistance: 0, color: c.blueShadow1 },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.blueShadow2, inset: true },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.blueShadow3, inset: true },
  ];

  const RAISED_BLUE_INNER: ViewStyle['boxShadow'] = [
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: c.blueDepressedInner, inset: true },
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.blueDepressedInnerLight, inset: true },
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.blueDepressedInnerEdge, inset: true },
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: c.blueDepressedInnerEdge, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.blueDepressedInnerRim },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.blueDepressedInnerLight },
  ];

  const DEPRESSED_BLUE_OUTER: ViewStyle['boxShadow'] = [
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: c.blueDepressedOuter, inset: true },
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.blueDepressedOuterSub, inset: true },
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.blueDepressedOuterEdge, inset: true },
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: c.blueDepressedOuterEdge, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.blueDepressedOuterRim },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.blueDepressedOuterSub },
  ];

  const DEPRESSED_BLUE_INNER: ViewStyle['boxShadow'] = [
    { offsetX: 1, offsetY: 1, blurRadius: 3, spreadDistance: 0, color: c.blueDepressedInner, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.blueDepressedInnerLight, inset: true },
    { offsetX: 1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.blueDepressedInnerEdge, inset: true },
    { offsetX: -1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.blueDepressedInnerEdge, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.blueDepressedInnerRim },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.blueDepressedInnerLight },
  ];

  return {
    raised: {
      normal: { outer: RAISED_WHITE_OUTER, inner: RAISED_WHITE_INNER },
      pressed: { outer: DEPRESSED_WHITE_OUTER, inner: DEPRESSED_WHITE_INNER },
    },
    blue: {
      normal: { outer: RAISED_BLUE_OUTER, inner: RAISED_BLUE_INNER },
      pressed: { outer: DEPRESSED_BLUE_OUTER, inner: DEPRESSED_BLUE_INNER },
    },
  };
}

function buildBgColors(c: ColorPalette): Record<ButtonVariant, { outer: string; outerPressed: string; inner: string; innerPressed: string }> {
  return {
    raised: { outer: c.grayButton, outerPressed: c.outerButtonPressed, inner: c.white, innerPressed: c.white },
    blue: { outer: c.blue, outerPressed: '#0084F5', inner: c.blueFill, innerPressed: c.blueFill },
  };
}

// ─── Hold-to-repeat constants ─────────────────────────────────────────────
const HOLD_INITIAL_DELAY = 400;   // ms before first repeat
const HOLD_START_INTERVAL = 300;  // ms between first repeats
const HOLD_MIN_INTERVAL = 50;     // fastest repeat speed
const HOLD_DECAY = 0.82;          // exponential decay factor

export const AnimatedIconButton: React.FC<AnimatedIconButtonProps> = ({
  iconName,
  label,
  onPress,
  variant = 'raised',
  size = scale(111),
  disabled = false,
  locked = false,
  holdable = false,
}) => {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const shadowMap = useMemo(() => buildShadows(colors), [colors]);
  const bgColors = useMemo(() => buildBgColors(colors), [colors]);

  // ── Hold-to-repeat refs ──
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef(HOLD_START_INTERVAL);
  const holdActiveRef = useRef(false);
  const onPressRef = useRef(onPress);

  // Keep onPress ref in sync so the timer always calls the latest version
  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      holdActiveRef.current = false;
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  const startHold = useCallback(() => {
    holdIntervalRef.current = HOLD_START_INTERVAL;
    holdActiveRef.current = true;

    const tick = () => {
      if (!holdActiveRef.current) return;
      onPressRef.current();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      holdIntervalRef.current = Math.max(
        HOLD_MIN_INTERVAL,
        holdIntervalRef.current * HOLD_DECAY,
      );
      holdTimerRef.current = setTimeout(tick, holdIntervalRef.current);
    };

    // First repeat after initial delay
    holdTimerRef.current = setTimeout(tick, HOLD_INITIAL_DELAY);
  }, []);

  const stopHold = useCallback(() => {
    holdActiveRef.current = false;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const showDepressed = isPressed || locked;
  const state = showDepressed ? 'pressed' : 'normal';
  const shadows = shadowMap[variant][state];
  const variantColors = bgColors[variant];
  const outerBg = showDepressed ? variantColors.outerPressed : variantColors.outer;
  const innerBg = showDepressed ? variantColors.innerPressed : variantColors.inner;
  const iconColor = variant === 'blue' ? '#FFFFFF' : colors.black;
  const innerSize = size - scale(26);

  const triggerHaptic = () => {
    if (locked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.black }]}>{label}</Text>
      <Pressable
        onPressIn={() => {
          setIsPressed(true);
          triggerHaptic();
          if (holdable && !locked) {
            onPress();          // immediate first action
            startHold();        // begin accelerating repeats
          }
        }}
        onPressOut={() => {
          setIsPressed(false);
          if (holdable) {
            stopHold();
          } else {
            onPress();
          }
        }}
        disabled={disabled}
        style={[
          styles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: scale(20),
            backgroundColor: outerBg,
            boxShadow: shadows.outer,
          },
          disabled && styles.disabled,
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: 9999,
              backgroundColor: innerBg,
              boxShadow: shadows.inner,
            },
          ]}
        >
          {iconName !== '' && (
            <LucideIcon
              name={iconName}
              size={scale(26)}
              color={iconColor}
              strokeWidth={2}
            />
          )}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: scale(8),
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: scale(14),
    textAlign: 'center',
  },
  outerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
