import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, scale, verticalScale } from '../constants/theme';

type ButtonVariant = 'inset' | 'raised' | 'green' | 'red';

interface NeumorphicButtonProps {
  label?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  width?: number;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  children?: React.ReactNode;
}

// boxShadow: array of {offsetX, offsetY, blurRadius, spreadDistance, color, inset?}
// Matches the CSS box-shadow stacks from the design specs exactly.

const SHADOWS: Record<ButtonVariant, ViewStyle['boxShadow']> = {
  inset: [
    // 5px 5px 13px rgba(230,230,230,0.90) inset
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: 'rgba(230,230,230,0.90)', inset: true },
    // -5px -5px 10px rgba(255,255,255,0.90) inset
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(255,255,255,0.90)', inset: true },
    // 5px -5px 10px rgba(230,230,230,0.20) inset
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(230,230,230,0.20)', inset: true },
    // -5px 5px 10px rgba(230,230,230,0.20) inset
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: 'rgba(230,230,230,0.20)', inset: true },
    // -1px -1px 2px rgba(230,230,230,0.50)
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(230,230,230,0.50)' },
    // 1px 1px 2px rgba(255,255,255,0.30)
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(255,255,255,0.30)' },
  ],
  raised: [
    // 2px 2px 5px rgba(174,174,174,0.90)
    { offsetX: 2, offsetY: 2, blurRadius: 5, spreadDistance: 0, color: 'rgba(174,174,174,0.90)' },
    // -2px -2px 4px rgba(255,255,255,0.90)
    { offsetX: -2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: 'rgba(255,255,255,0.90)' },
    // 2px -2px 4px rgba(174,174,174,0.20)
    { offsetX: 2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: 'rgba(174,174,174,0.20)' },
    // -2px 2px 4px rgba(174,174,174,0.20)
    { offsetX: -2, offsetY: 2, blurRadius: 4, spreadDistance: 0, color: 'rgba(174,174,174,0.20)' },
    // -1px -1px 2px rgba(174,174,174,0.50) inset
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(174,174,174,0.50)', inset: true },
    // 1px 1px 2px rgba(255,255,255,0.30) inset
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(255,255,255,0.30)', inset: true },
  ],
  green: [
    // 2px 2px 5px rgba(0,130,36,0.90)
    { offsetX: 2, offsetY: 2, blurRadius: 5, spreadDistance: 0, color: 'rgba(0,130,36,0.90)' },
    // -2px -2px 4px rgba(0,242,68,0.90)
    { offsetX: -2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: 'rgba(0,242,68,0.90)' },
    // 2px -2px 4px rgba(0,130,36,0.20)
    { offsetX: 2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: 'rgba(0,130,36,0.20)' },
    // -2px 2px 4px rgba(0,130,36,0.20)
    { offsetX: -2, offsetY: 2, blurRadius: 4, spreadDistance: 0, color: 'rgba(0,130,36,0.20)' },
    // -1px -1px 2px rgba(0,130,36,0.50) inset
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(0,130,36,0.50)', inset: true },
    // 1px 1px 2px rgba(0,242,68,0.30) inset
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(0,242,68,0.30)', inset: true },
  ],
  red: [
    // 2px 2px 5px rgba(163,31,31,0.90)
    { offsetX: 2, offsetY: 2, blurRadius: 5, spreadDistance: 0, color: 'rgba(163,31,31,0.90)' },
    // -2px -2px 4px rgba(255,57,57,0.90)
    { offsetX: -2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: 'rgba(255,57,57,0.90)' },
    // 2px -2px 4px rgba(163,31,31,0.20)
    { offsetX: 2, offsetY: -2, blurRadius: 4, spreadDistance: 0, color: 'rgba(163,31,31,0.20)' },
    // -2px 2px 4px rgba(163,31,31,0.20)
    { offsetX: -2, offsetY: 2, blurRadius: 4, spreadDistance: 0, color: 'rgba(163,31,31,0.20)' },
    // -1px -1px 2px rgba(163,31,31,0.50) inset
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(163,31,31,0.50)', inset: true },
    // 1px 1px 2px rgba(255,57,57,0.30) inset
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(255,57,57,0.30)', inset: true },
  ],
};

const BG_COLORS: Record<ButtonVariant, string> = {
  inset: COLORS.white,
  raised: COLORS.white,
  green: COLORS.green,
  red: COLORS.red,
};

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  label,
  onPress,
  variant = 'raised',
  width,
  disabled = false,
  style,
  labelStyle,
  children,
}) => {
  const buttonWidth = width ?? scale(321);
  const textColor =
    variant === 'green' || variant === 'red' ? COLORS.white : COLORS.black;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          width: buttonWidth,
          backgroundColor: BG_COLORS[variant],
          boxShadow: SHADOWS[variant],
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {children ?? (
        <Text style={[styles.label, { color: textColor }, labelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: verticalScale(60),
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: scale(15),
    fontFamily: FONTS.mono,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
