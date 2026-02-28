export type ShortcutCategory = 'app' | 'camera' | 'system' | 'interaction' | 'multimedia';

export interface ShortcutAction {
  category: ShortcutCategory;
  label: string;
  actionType: string;
  iconName: string;
  appName?: string;
  packageName?: string;
}

export interface GestureShortcut {
  gestureIndex: number;
  action: ShortcutAction | null;
  lastUsed: string | null;
  isActive: boolean;
}

export const GESTURE_LABELS = ['ONE', 'TWO', 'THREE'] as const;

export interface ShortcutCategoryDef {
  category: ShortcutCategory;
  label: string;
  actions: { label: string; actionType: string; iconName: string }[];
}

export const SHORTCUT_CATALOG: ShortcutCategoryDef[] = [
  {
    category: 'app',
    label: 'Open App',
    actions: [
      { label: '', actionType: 'Open Application', iconName: 'layout-grid' },
    ],
  },
  {
    category: 'camera',
    label: 'Camera',
    actions: [
      { label: 'Open Camera', actionType: 'Camera', iconName: 'camera' },
      { label: 'Flip Camera', actionType: 'Camera', iconName: 'switch-camera' },
      { label: 'Capture / Toggle Record', actionType: 'Camera', iconName: 'image' },
      { label: 'Switch Camera Mode', actionType: 'Camera', iconName: 'video' },
    ],
  },
  {
    category: 'system',
    label: 'System',
    actions: [
      { label: 'Toggle Bluetooth', actionType: 'System', iconName: 'bluetooth' },
      { label: 'Toggle Wifi', actionType: 'System', iconName: 'wifi' },
      { label: 'Toggle Mobile Data', actionType: 'System', iconName: 'sim-card' },
      { label: 'Toggle Do Not Disturb', actionType: 'System', iconName: 'circle-minus' },
      { label: 'Toggle Power Saving', actionType: 'System', iconName: 'leaf' },
      { label: 'Lock Screen', actionType: 'System', iconName: 'lock' },
    ],
  },
  {
    category: 'interaction',
    label: 'Interaction',
    actions: [
      { label: 'Swipe Up', actionType: 'Interaction', iconName: 'arrow-up' },
      { label: 'Swipe Down', actionType: 'Interaction', iconName: 'arrow-down' },
      { label: 'Swipe Left', actionType: 'Interaction', iconName: 'arrow-left' },
      { label: 'Swipe Right', actionType: 'Interaction', iconName: 'arrow-right' },
    ],
  },
  {
    category: 'multimedia',
    label: 'Multi-Media',
    actions: [
      { label: 'Volume Up', actionType: 'Media Control', iconName: 'volume-2' },
      { label: 'Volume Down', actionType: 'Media Control', iconName: 'volume-1' },
      { label: 'Pause / Play Media', actionType: 'Media Control', iconName: 'play' },
      { label: 'Next Song', actionType: 'Media Control', iconName: 'skip-forward' },
      { label: 'Previous Song', actionType: 'Media Control', iconName: 'skip-back' },
    ],
  },
];

export const DEFAULT_SHORTCUTS: GestureShortcut[] = [
  { gestureIndex: 0, action: null, lastUsed: null, isActive: false },
  { gestureIndex: 1, action: null, lastUsed: null, isActive: false },
  { gestureIndex: 2, action: null, lastUsed: null, isActive: false },
];
