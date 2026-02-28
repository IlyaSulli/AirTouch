import React from 'react';
import {
  Camera,
  SwitchCamera,
  Image,
  Video,
  Bluetooth,
  Wifi,
  CardSim,
  CircleMinus,
  Leaf,
  Lock,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Volume2,
  Volume1,
  Play,
  SkipForward,
  SkipBack,
  LayoutGrid,
  CircleSlash,
  ArrowBigLeftDash,
  Pen,
  ArrowBigRightDash,
  Settings,
  SlidersHorizontal,
  GalleryHorizontalEnd,
  Music,
  ChevronLeft,
  ChevronRight,
  Undo2,
  Sun,
  Moon,
  SunMoon,
  type LucideProps,
} from 'lucide-react-native';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  'camera': Camera,
  'switch-camera': SwitchCamera,
  'image': Image,
  'video': Video,
  'bluetooth': Bluetooth,
  'wifi': Wifi,
  'sim-card': CardSim,
  'circle-minus': CircleMinus,
  'leaf': Leaf,
  'lock': Lock,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'volume-2': Volume2,
  'volume-1': Volume1,
  'play': Play,
  'skip-forward': SkipForward,
  'skip-back': SkipBack,
  'layout-grid': LayoutGrid,
  'circle-slash': CircleSlash,
  'arrow-big-left-dash': ArrowBigLeftDash,
  'pen': Pen,
  'arrow-big-right-dash': ArrowBigRightDash,
  'settings': Settings,
  'sliders-horizontal': SlidersHorizontal,
  'gallery-horizontal-end': GalleryHorizontalEnd,
  'music': Music,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'undo-2': Undo2,
  'sun': Sun,
  'moon': Moon,
  'sun-moon': SunMoon
};

interface LucideIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const LucideIcon: React.FC<LucideIconProps> = ({
  name,
  size = 24,
  color = '#000000',
  strokeWidth = 2,
}) => {
  const IconComponent = ICON_MAP[name] ?? CircleSlash;
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
};
