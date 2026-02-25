import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, scale } from '../constants/theme';

interface GestureBoxProps {
  value: string;
  success: boolean;
}

const DEFAULT_SHADOWS: ViewStyle['boxShadow'] = [
  // 5px 5px 13px rgba(224,224,224,0.90)
  { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: 'rgba(224,224,224,0.90)' },
  // -5px -5px 10px rgba(255,255,255,0.90)
  { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(255,255,255,0.90)' },
  // 5px -5px 10px rgba(224,224,224,0.20)
  { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(224,224,224,0.20)' },
  // -5px 5px 10px rgba(224,224,224,0.20)
  { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: 'rgba(224,224,224,0.20)' },
  // -1px -1px 2px rgba(224,224,224,0.50) inset
  { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(224,224,224,0.50)', inset: true },
  // 1px 1px 2px rgba(255,255,255,0.30) inset
  { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(255,255,255,0.30)', inset: true },
];

const SUCCESS_SHADOWS: ViewStyle['boxShadow'] = [
  // 5px 5px 13px rgba(0,167,47,0.90)
  { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: 'rgba(0,167,47,0.90)' },
  // -5px -5px 10px rgba(0,205,57,0.90)
  { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(0,205,57,0.90)' },
  // 5px -5px 10px rgba(0,167,47,0.20)
  { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: 'rgba(0,167,47,0.20)' },
  // -5px 5px 10px rgba(0,167,47,0.20)
  { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: 'rgba(0,167,47,0.20)' },
  // -1px -1px 2px rgba(0,167,47,0.50) inset
  { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: 'rgba(0,167,47,0.50)', inset: true },
  // 1px 1px 2px rgba(0,205,57,0.30) inset
  { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: 'rgba(0,205,57,0.30)', inset: true },
];

export const GestureBox: React.FC<GestureBoxProps> = ({ value, success }) => {
  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: success ? COLORS.green : '#F2F2F2',
          boxShadow: success ? SUCCESS_SHADOWS : DEFAULT_SHADOWS,
        },
      ]}
    >
      <Text
        style={[
          styles.digit,
          { color: success ? COLORS.white : COLORS.black },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: scale(130),
    height: scale(130),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: scale(48),
    fontFamily: FONTS.monoBold,
  },
});
