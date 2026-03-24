import React, { useState, useMemo } from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FONTS, scale } from '../../constants/theme';
import type { ColorPalette } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { LucideIcon } from './LucideIcon';

type SmallButtonVariant = 'raised' | 'lightBlue';

interface SmallIconButtonProps {
  iconName: string;
  onPress: () => void;
  variant?: SmallButtonVariant;
  locked?: boolean;
}

const BTN_SIZE = scale(76);
const INNER_SIZE = scale(58);
const ICON_SIZE = scale(24);

// ── Raised white - built from theme ─────────────────────────────────────────
function buildSmallShadows(c: ColorPalette) {
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

  // ── Light-blue Settings button ────────────────────────────────────────────────
  const RAISED_BLUE_OUTER: ViewStyle['boxShadow'] = [
    { offsetX: 2, offsetY: 2, blurRadius: 5, spreadDistance: 0, color: 'rgba(100,165,220,0.90)' },
    { offsetX: -2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: 'rgba(190,230,255,0.90)' },
    { offsetX: 2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: 'rgba(100,165,220,0.20)' },
    { offsetX: -2, offsetY: 2, blurRadius: 4, spreadDistance: 0, color: 'rgba(100,165,220,0.20)' },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(100,165,220,0.50)', inset: true },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(190,230,255,0.30)', inset: true },
  ];

  const RAISED_BLUE_INNER: ViewStyle['boxShadow'] = [
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: 'rgba(110,180,230,0.90)', inset: true },
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(190,230,255,0.90)', inset: true },
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(110,180,230,0.20)', inset: true },
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: 'rgba(110,180,230,0.20)', inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(110,180,230,0.50)' },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(190,230,255,0.30)' },
  ];

  const DEPRESSED_BLUE_OUTER: ViewStyle['boxShadow'] = [
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: 'rgba(100,165,220,0.90)', inset: true },
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(190,230,255,0.90)', inset: true },
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(100,165,220,0.20)', inset: true },
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: 'rgba(100,165,220,0.20)', inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(100,165,220,0.50)' },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(190,230,255,0.30)' },
  ];

  const DEPRESSED_BLUE_INNER: ViewStyle['boxShadow'] = [
    { offsetX: 1, offsetY: 1, blurRadius: 3, spreadDistance: 0, color: 'rgba(110,180,230,0.90)', inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(190,230,255,0.90)', inset: true },
    { offsetX: 1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(110,180,230,0.20)', inset: true },
    { offsetX: -1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(110,180,230,0.20)', inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(110,180,230,0.50)' },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(190,230,255,0.30)' },
  ];

  return {
    raised: {
      normal: { outer: RAISED_WHITE_OUTER, inner: RAISED_WHITE_INNER },
      pressed: { outer: DEPRESSED_WHITE_OUTER, inner: DEPRESSED_WHITE_INNER },
    },
    lightBlue: {
      normal: { outer: RAISED_BLUE_OUTER, inner: RAISED_BLUE_INNER },
      pressed: { outer: DEPRESSED_BLUE_OUTER, inner: DEPRESSED_BLUE_INNER },
    },
  };
}

function buildSmallBg(c: ColorPalette): Record<SmallButtonVariant, { outer: string; outerPressed: string; inner: string; innerPressed: string }> {
  return {
    raised: {
      outer: c.grayButton,
      outerPressed: c.outerButtonPressed,
      inner: c.white,
      innerPressed: c.white,
    },
    lightBlue: {
      outer: '#8CC5F5',
      outerPressed: '#8CC5F5',
      inner: '#9DD0FA',
      innerPressed: '#9DD0FA',
    },
  };
}

export const SmallIconButton: React.FC<SmallIconButtonProps> = ({
  iconName,
  onPress,
  variant = 'raised',
  locked = false,
}) => {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const shadowMap = useMemo(() => buildSmallShadows(colors), [colors]);
  const bgMap = useMemo(() => buildSmallBg(colors), [colors]);

  const showDepressed = isPressed || locked;
  const state = showDepressed ? 'pressed' : 'normal';
  const shadows = shadowMap[variant][state];
  const variantColors = bgMap[variant];
  const outerBg = showDepressed ? variantColors.outerPressed : variantColors.outer;
  const innerBg = showDepressed ? variantColors.innerPressed : variantColors.inner;
  const iconColor = variant === 'lightBlue' ? colors.white : colors.black;

  const triggerHaptic = () => {
    if (locked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPressIn={() => {
          setIsPressed(true);
          triggerHaptic();
        }}
        onPressOut={() => {
          setIsPressed(false);
          onPress();
        }}
        style={[
          styles.outerSquare,
          {
            backgroundColor: outerBg,
            boxShadow: shadows.outer,
          },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              backgroundColor: innerBg,
              boxShadow: shadows.inner,
            },
          ]}
        >
          <LucideIcon
            name={iconName}
            size={ICON_SIZE}
            color={iconColor}
            strokeWidth={2}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  outerSquare: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
