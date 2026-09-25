import { Colors } from './colors';

export type ThemeId = 'ocean' | 'dark' | 'light' | 'system';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  background: string;
  surface: string;
  surfaceCard: string;
  surfaceHover: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderFocus: string;
  divider: string;
  oceanDepths: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  strawHatRibbon: string;
  goldCoin: string;
  courseThemes: Record<string, { primary: string; secondary: string; bg: string }>;
}

export interface AppThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  icon: string;
  isDark: boolean;
  colors: ThemeColors;
}

export const OceanTheme: AppThemeDefinition = {
  id: 'ocean',
  name: 'Ocean Adventure',
  subtitle: 'Grand Line Deep Blue Waters & Cyan Waves',
  icon: 'water-outline',
  isDark: true,
  colors: {
    primary: '#00B4D8',
    primaryDark: '#0077B6',
    secondary: '#FFB300',
    secondaryDark: '#FF8F00',
    accent: '#5BC0BE',
    accentLight: '#1C3144',
    background: '#0B132B',
    surface: '#1C2541',
    surfaceCard: '#1C2541',
    surfaceHover: '#243257',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textInverse: '#0B132B',
    border: '#2A385C',
    borderFocus: '#00B4D8',
    divider: '#1E2C4C',
    oceanDepths: '#080E21',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#38BDF8',
    strawHatRibbon: '#E53935',
    goldCoin: '#FACC15',
    courseThemes: Colors.courseThemes,
  },
};

export const DarkTheme: AppThemeDefinition = {
  id: 'dark',
  name: 'Dark Adventure',
  subtitle: 'Pirate Midnight Slate & Straw Hat Red',
  icon: 'moon-outline',
  isDark: true,
  colors: {
    primary: '#E53935',
    primaryDark: '#B71C1C',
    secondary: '#FFB300',
    secondaryDark: '#FF8F00',
    accent: '#0288D1',
    accentLight: '#1E293B',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceCard: '#1E293B',
    surfaceHover: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textInverse: '#0F172A',
    border: '#334155',
    borderFocus: '#E53935',
    divider: '#253248',
    oceanDepths: '#0A0F1D',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    strawHatRibbon: '#D32F2F',
    goldCoin: '#FACC15',
    courseThemes: Colors.courseThemes,
  },
};

export const LightTheme: AppThemeDefinition = {
  id: 'light',
  name: 'Light Adventure',
  subtitle: 'Crisp Island Parchment & Bright Deck White',
  icon: 'sunny-outline',
  isDark: false,
  colors: {
    ...Colors,
    surfaceCard: '#FFFFFF',
    courseThemes: Colors.courseThemes,
  },
};

export const APP_THEMES: Record<ThemeId, AppThemeDefinition> = {
  ocean: OceanTheme,
  dark: DarkTheme,
  light: LightTheme,
  system: DarkTheme, // Default system fallback to Dark Adventure
};
