import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { FONTS, scale, verticalScale } from '../../constants/theme';
import type { ColorPalette } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { SmallIconButton } from './SmallIconButton';

interface GestureToggleProps {
  isActive: boolean;
  onToggle: (value: boolean) => void;
  onSettingsPress: () => void;
  onBackPress: () => void;
  disabled?: boolean;
  backLocked?: boolean;
  isSettingsMode?: boolean;
}

const TRACK_WIDTH = scale(78);
const TRACK_HEIGHT = scale(40);
const TRACK_INNER_WIDTH = scale(72);
const TRACK_INNER_HEIGHT = scale(34);
const KNOB_SIZE = scale(28);
const KNOB_TRAVEL = TRACK_INNER_WIDTH - KNOB_SIZE - scale(4);

function buildToggleShadows(c: ColorPalette) {
  const TOGGLE_TRACK_SHADOW: ViewStyle['boxShadow'] = [
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: c.toggleOuterShadowDark },
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.toggleOuterShadowLight },
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.toggleOuterShadowEdge },
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: c.toggleOuterShadowEdge },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.toggleOuterInsetDark, inset: true },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.toggleOuterInsetLight, inset: true },
  ];

  const KNOB_ACTIVE_SHADOW: ViewStyle['boxShadow'] = [
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: c.greenBoxDark, inset: true },
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.greenBoxLight, inset: true },
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.greenBoxShadow1, inset: true },
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: c.greenBoxShadow1, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.greenBoxShadow2 },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.greenBoxShadow3 },
  ];

  const KNOB_INACTIVE_SHADOW: ViewStyle['boxShadow'] = [
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: c.knobInactiveShadowDark, inset: true },
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.knobInactiveShadowLight, inset: true },
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.knobInactiveShadowEdge, inset: true },
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: c.knobInactiveShadowEdge, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.knobInactiveShadowRim },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.knobInactiveShadowGlow },
  ];

  const KNOB_DISABLED_SHADOW: ViewStyle['boxShadow'] = [
    { offsetX: 5, offsetY: 5, blurRadius: 13, spreadDistance: 0, color: c.depressedBtnInnerDark, inset: true },
    { offsetX: -5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.depressedBtnInnerLight, inset: true },
    { offsetX: 5, offsetY: -5, blurRadius: 10, spreadDistance: 0, color: c.depressedBtnInnerEdge, inset: true },
    { offsetX: -5, offsetY: 5, blurRadius: 10, spreadDistance: 0, color: c.depressedBtnInnerEdge, inset: true },
    { offsetX: -1, offsetY: -1, blurRadius: 2, spreadDistance: 0, color: c.depressedBtnInnerRim },
    { offsetX: 1, offsetY: 1, blurRadius: 2, spreadDistance: 0, color: c.depressedBtnInnerGlow },
  ];

  return { TOGGLE_TRACK_SHADOW, KNOB_ACTIVE_SHADOW, KNOB_INACTIVE_SHADOW, KNOB_DISABLED_SHADOW };
}

export const GestureToggle: React.FC<GestureToggleProps> = ({
  isActive,
  onToggle,
  onSettingsPress,
  onBackPress,
  disabled = false,
  backLocked = false,
}) => {
  const { colors } = useTheme();
  const toggleShadows = useMemo(() => buildToggleShadows(colors), [colors]);
  const translateX = useSharedValue(isActive ? KNOB_TRAVEL : 0);

  React.useEffect(() => {
    translateX.value = withSpring(isActive ? KNOB_TRAVEL : 0, {
      damping: 120,
      stiffness: 1000,
      mass: 3,
      energyThreshold: 6e-9,
      overshootClamping: true,
    });
  }, [isActive, translateX]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={[styles.label, { color: colors.black }]}>Gesture Active</Text>
        <Pressable
          disabled={disabled}
          onPress={() => {
            if (isActive) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } else {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onToggle(!isActive);
          }}
        >
          <View style={[styles.trackOuter, { backgroundColor: colors.toggleTrack, boxShadow: toggleShadows.TOGGLE_TRACK_SHADOW }]}>
            <View style={[styles.trackInner, { backgroundColor: colors.toggleTrackInner, boxShadow: toggleShadows.TOGGLE_TRACK_SHADOW }]}>
              <Animated.View
                style={[
                  styles.knob,
                  {
                    backgroundColor: disabled
                      ? colors.knobDisabled
                      : isActive
                        ? colors.green
                        : colors.knobInactive,
                    boxShadow: disabled
                      ? toggleShadows.KNOB_DISABLED_SHADOW
                      : isActive
                        ? toggleShadows.KNOB_ACTIVE_SHADOW
                        : toggleShadows.KNOB_INACTIVE_SHADOW,
                  },
                  knobStyle,
                ]}
              />
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.rightSection}>
        <SmallIconButton
          iconName="undo-2"
          onPress={onBackPress}
          variant="raised"
          locked={backLocked}
        />
        <SmallIconButton
          iconName="settings"
          onPress={onSettingsPress}
          variant="lightBlue"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(24),
    marginTop: verticalScale(16),
  },
  leftSection: {
    gap: scale(8),
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: scale(12),
    opacity: 0.5,
  },
  trackOuter: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInner: {
    width: TRACK_INNER_WIDTH,
    height: TRACK_INNER_HEIGHT,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(2),
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: 9999,
  },
  rightSection: {
    flexDirection: 'row',
    gap: scale(10),
    alignItems: 'flex-end',
  },
});
