import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  LIGHT_COLORS,
  DARK_COLORS,
  type ColorPalette,
} from '../constants/theme';
import { getThemeMode, storeThemeMode, type ThemeMode } from '../services/storage';

interface ThemeContextValue {
  colors: ColorPalette;
  mode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: LIGHT_COLORS,
  mode: 'light',
  isDark: false,
  setThemeMode: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  // Load persisted theme on mount
  useEffect(() => {
    (async () => {
      const stored = await getThemeMode();
      setMode(stored);
      setLoaded(true);
    })();
  }, []);

  const setThemeModeAndPersist = useCallback(async (newMode: ThemeMode) => {
    setMode(newMode);
    await storeThemeMode(newMode);
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'system') return systemScheme === 'dark';
    return mode === 'dark';
  }, [mode, systemScheme]);

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const value = useMemo<ThemeContextValue>(
    () => ({ colors, mode, isDark, setThemeMode: setThemeModeAndPersist }),
    [colors, mode, isDark, setThemeModeAndPersist],
  );

  // Don't render until saved preference is loaded
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
