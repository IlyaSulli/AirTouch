import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { FONTS, scale, verticalScale } from '../../constants/theme';
import type { ColorPalette } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { GestureShortcut } from '../../types/shortcuts';
import { LucideIcon } from './LucideIcon';
import { BlueGlow } from './BackgroundEffects';
import { ShortcutWheel } from './ShortcutWheel';
import { EditCarousel } from './EditCarousel';
import { SubActionCarousel } from './SubActionCarousel';
import { AppListCarousel } from './AppListCarousel';
import {
  SETTINGS_LABELS,
  ThemeView,
  ThemeEditCarousel,
  PreviewView,
  ConnectView,
} from './SettingsContent';
import type { ThemeMode } from '../../services/storage';
import type { InstalledApp } from '../../../modules/installed-apps';

interface VirtualScreenCardProps {
  currentIndex: number;
  shortcut: GestureShortcut;
  isGestureActive: boolean;
  isEditing?: boolean;
  editCategoryIndex?: number;
  isSubMenuActive?: boolean;
  subActionIndex?: number;
  installedApps?: InstalledApp[];
  // Settings mode
  isSettingsMode?: boolean;
  settingsIndex?: number;
  currentTheme?: ThemeMode;
  isSettingsEditing?: boolean;
  settingsEditIndex?: number;
  detectedGesture?: number | null;
  connectedDeviceName?: string | null;
  isConnected?: boolean;
  permissionMissing?: boolean;
}

function formatLastUsed(isoString: string | null): string {
  if (!isoString) return 'Never used';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'Just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `Used ${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Used ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Used ${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return 'Used yesterday';
  if (diffDays < 7) return `Used ${diffDays}d ago`;
  return `Used ${date.getDate()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

const CARD_W = scale(360);
const CARD_H = verticalScale(259);

const ICON_SHADOW: ViewStyle['boxShadow'] = [
  { offsetX: 0, offsetY: 0, blurRadius: 4, spreadDistance: 0, color: 'rgba(124,124,124,0.50)' },
];

// ─── Screen overlay ───────────────────────────────────────────────────────────
// Simulates the design spec:
//   inset:  3px 4px 11.8px rgba(0,0,0,0.25)  → dark feather on top + left
//   inset: -1px -1px 0.9px rgba(0,0,0,0.25)  → tight dark edge on bottom + right
//   glare:  diagonal triangle, 75% down left → top-right, white gradient
//
// IMPORTANT: react-native-svg ignores alpha inside rgba stopColor values.
// Always use separate stopColor + stopOpacity attributes.
function ScreenOverlay() {
  const glareY = CARD_H * 0.75;

  return (
    <Svg
      width={CARD_W}
      height={CARD_H}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      <Defs>
        {/* Primary inset — top edge (~16px feather, 0.25 opacity) */}
        <LinearGradient id="isTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="black" stopOpacity="0.25" />
          <Stop offset="1" stopColor="black" stopOpacity="0" />
        </LinearGradient>

        {/* Primary inset — left edge (~14px feather) */}
        <LinearGradient id="isLeft" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="black" stopOpacity="0.22" />
          <Stop offset="1" stopColor="black" stopOpacity="0" />
        </LinearGradient>

        {/* Secondary inset — bottom edge (tight ~3px) */}
        <LinearGradient id="isBottom" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="black" stopOpacity="0.25" />
          <Stop offset="1" stopColor="black" stopOpacity="0" />
        </LinearGradient>

        {/* Secondary inset — right edge (tight ~3px) */}
        <LinearGradient id="isRight" x1="1" y1="0" x2="0" y2="0">
          <Stop offset="0" stopColor="black" stopOpacity="0.25" />
          <Stop offset="1" stopColor="black" stopOpacity="0" />
        </LinearGradient>

        {/* Screen glare — bright at top, darkens toward diagonal edge */}
        {/* Simulates Figma's white→#808080 gradient with soft-light blend */}
        <LinearGradient id="glare" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"    stopColor="white" stopOpacity="0.10" />
          <Stop offset="0.45" stopColor="white" stopOpacity="0" />
          <Stop offset="1"    stopColor="black" stopOpacity="0.06" />
        </LinearGradient>
      </Defs>

      {/* ── Inner shadows ────────────────────────────────────────── */}
      {/* Top: 4px offset + 11.8px blur ≈ 16px total feather depth */}
      <Rect x="0" y="0" width={CARD_W} height={scale(16)} fill="url(#isTop)" />
      {/* Left: 3px offset + 11.8px blur ≈ 14px feather (stops before bottom shadow) */}
      <Rect x="0" y="0" width={scale(14)} height={CARD_H - scale(3)} fill="url(#isLeft)" />
      {/* Bottom: 1px offset + 0.9px blur ≈ 3px tight edge */}
      <Rect x="0" y={CARD_H - scale(3)} width={CARD_W} height={scale(3)} fill="url(#isBottom)" />
      {/* Right: matches bottom (stops before bottom shadow) */}
      <Rect x={CARD_W - scale(3)} y="0" width={scale(3)} height={CARD_H - scale(3)} fill="url(#isRight)" />

      {/* ── Screen glare ─────────────────────────────────────────── */}
      {/* Triangle: (0, 75% down) → (0, 0) → (cardWidth, 0) */}
      <Polygon
        points={`0,${glareY} 0,0 ${CARD_W},0`}
        fill="url(#glare)"
      />
    </Svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export const VirtualScreenCard: React.FC<VirtualScreenCardProps> = ({
  currentIndex,
  shortcut,
  isGestureActive,
  isEditing = false,
  editCategoryIndex = 0,
  isSubMenuActive = false,
  subActionIndex = 0,
  installedApps = [],
  isSettingsMode = false,
  settingsIndex = 0,
  currentTheme = 'light',
  isSettingsEditing = false,
  settingsEditIndex = 0,
  detectedGesture = null,
  connectedDeviceName = null,
  isConnected = false,
  permissionMissing = false,
}) => {
  const { colors } = useTheme();
  const hasAction = shortcut.action !== null;

  // Determine which wheel labels and index to use
  const wheelLabels = isSettingsMode ? SETTINGS_LABELS : undefined;
  const wheelIndex = isSettingsMode ? settingsIndex : currentIndex;

  return (
    <View style={[styles.card, { backgroundColor: colors.screenBg }]}>
      <View style={styles.wheelSection}>
        <ShortcutWheel currentIndex={wheelIndex} labels={wheelLabels} />
      </View>

      {isSettingsMode ? (
        /* ── Settings mode ── */
        isSettingsEditing && settingsIndex === 1 ? (
          /* Theme edit carousel */
          <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(200)}
            style={styles.editBody}
          >
            <ThemeEditCarousel selectedIndex={settingsEditIndex} />
          </Animated.View>
        ) : (
          /* Settings view (read-only) */
          <>
            {settingsIndex === 0 && (
              <PreviewView detectedGesture={detectedGesture} />
            )}
            {settingsIndex === 1 && (
              <ThemeView currentTheme={currentTheme} />
            )}
            {settingsIndex === 2 && (
              <ConnectView deviceName={connectedDeviceName} />
            )}
          </>
        )
      ) : isEditing ? (
        /* ── Edit mode: carousel replaces content + status bar ── */
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={styles.editBody}
        >
          {isSubMenuActive ? (
            editCategoryIndex === 0 ? (
              <AppListCarousel selectedIndex={subActionIndex} apps={installedApps} />
            ) : (
              <SubActionCarousel
                categoryIndex={editCategoryIndex}
                selectedIndex={subActionIndex}
              />
            )
          ) : (
            <EditCarousel selectedIndex={editCategoryIndex} />
          )}
        </Animated.View>
      ) : (
        /* ── Normal mode ── */
        <>
          <View style={styles.contentArea}>
            {hasAction ? (
              <>
                <View style={styles.iconContainer}>
                  <LucideIcon
                    name={shortcut.action!.iconName}
                    size={scale(37.5)}
                    color={colors.black}
                    strokeWidth={2}
                  />
                </View>
                <Text style={[styles.actionType, { color: colors.black, textShadowColor: colors.textShadow }]}>{shortcut.action!.actionType}</Text>
                <Text style={[styles.actionLabel, { color: colors.black, textShadowColor: colors.textShadow }]}>{shortcut.action!.label}</Text>
                {permissionMissing && (
                  <Text style={[styles.permissionHint, { color: colors.red }]}>
                    Permission required
                  </Text>
                )}
              </>
            ) : (
              <Text style={[styles.fallbackText, { color: colors.textMuted }]}>Press edit to add{'\n'}shortcut action</Text>
            )}
          </View>

          <View style={styles.statusBar}>
            <Text style={[styles.timestampText, { color: colors.black }]}>{formatLastUsed(shortcut.lastUsed)}</Text>
            <View style={styles.activeIndicator}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.green : colors.statusInactive }]} />
              <Text style={[styles.statusText, { color: isConnected ? colors.green : colors.statusInactive }]}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Blue glow at bottom center */}
      <BlueGlow />

      {/* Inner shadow + screen glare */}
      <ScreenOverlay />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: scale(20),
    alignSelf: 'center',
    overflow: 'hidden',
  },
  wheelSection: {
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(8),
  },
  editBody: {
    flex: 1,
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    marginTop: scale(-20)
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  actionLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: scale(24),
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  actionType: {
    fontFamily: FONTS.mono,
    fontSize: scale(15),
    textAlign: 'center',
    marginTop: verticalScale(4),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  fallbackText: {
    fontFamily: FONTS.mono,
    fontSize: scale(15),
    textAlign: 'center',
    lineHeight: scale(22),
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(12),
  },
  timestampText: {
    fontFamily: FONTS.mono,
    fontSize: scale(12),
    opacity: 0.5,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: 9999,
  },
  statusText: {
    fontFamily: FONTS.mono,
    fontSize: scale(12),
  },
  permissionHint: {
    fontFamily: FONTS.mono,
    fontSize: scale(10),
    textAlign: 'center' as const,
    marginTop: verticalScale(4),
  },
});
