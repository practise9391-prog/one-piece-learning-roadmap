import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeId, AppThemeDefinition, APP_THEMES, OceanTheme, DarkTheme, LightTheme } from './themes';
import { DatabaseManager } from '../database/DatabaseManager';

interface ThemeContextType {
  themeId: ThemeId;
  theme: AppThemeDefinition;
  setThemeId: (id: ThemeId) => Promise<void>;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  themeId: 'ocean',
  theme: OceanTheme,
  setThemeId: async () => {},
  reducedMotion: false,
  setReducedMotion: async () => {},
  isDark: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeId, setThemeIdState] = useState<ThemeId>('ocean');
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Load preferences from SQLite on launch
  useEffect(() => {
    let isMounted = true;
    const loadThemeFromDb = async () => {
      try {
        const db = await DatabaseManager.getInstance().getDatabase();
        const themeRow = await db.getFirstAsync<{ value: string }>(
          'SELECT value FROM app_settings WHERE key = ?;',
          ['theme_id']
        );
        const motionRow = await db.getFirstAsync<{ value: string }>(
          'SELECT value FROM app_settings WHERE key = ?;',
          ['reduced_motion']
        );

        if (isMounted) {
          if (themeRow?.value && (themeRow.value === 'ocean' || themeRow.value === 'dark' || themeRow.value === 'light' || themeRow.value === 'system')) {
            setThemeIdState(themeRow.value as ThemeId);
          }
          if (motionRow?.value) {
            setReducedMotionState(motionRow.value === 'true');
          }
          setLoaded(true);
        }
      } catch (err) {
        // Fallback to default ocean theme if db not ready yet
        if (isMounted) setLoaded(true);
      }
    };

    loadThemeFromDb();
    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeId = async (id: ThemeId) => {
    setThemeIdState(id);
    try {
      const db = await DatabaseManager.getInstance().getDatabase();
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO app_settings (key, value, updated_at) VALUES ('theme_id', ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
        [id, now]
      );
    } catch (err) {
      console.warn('Failed to persist theme setting:', err);
    }
  };

  const setReducedMotion = async (val: boolean) => {
    setReducedMotionState(val);
    try {
      const db = await DatabaseManager.getInstance().getDatabase();
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO app_settings (key, value, updated_at) VALUES ('reduced_motion', ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
        [val ? 'true' : 'false', now]
      );
    } catch (err) {
      console.warn('Failed to persist reduced motion setting:', err);
    }
  };

  const resolvedTheme: AppThemeDefinition = useMemo(() => {
    if (themeId === 'system') {
      return systemColorScheme === 'dark' ? DarkTheme : LightTheme;
    }
    return APP_THEMES[themeId] || OceanTheme;
  }, [themeId, systemColorScheme]);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme: resolvedTheme,
        setThemeId,
        reducedMotion,
        setReducedMotion,
        isDark: resolvedTheme.isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
