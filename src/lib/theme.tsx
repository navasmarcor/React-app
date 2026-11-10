import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

const light = {
  bg: '#f3f5f8',
  surface: '#ffffff',
  ink: '#152033',
  muted: '#5a6678',
  line: '#dbe1ea',
  accent: '#1f5fd6',
  onAccent: '#ffffff',
  accentSoft: '#e3ecfc',
  red: '#e8261a',
  navy: '#152033',
  onNavy: '#ffffff',
  onNavyMuted: '#b8c3d6',
  good: '#16794a',
  goodSoft: '#e2f4ea',
  warn: '#9a5b00',
  warnSoft: '#fdf0d8',
  chip: '#e4e8ef',
  chip2: '#eef0f4',
  placeholder: '#98a2b3',
  black: '#000000',
  onBlack: '#ffffff',
};

export type Palette = typeof light;

const dark: Palette = {
  bg: '#0c1322',
  surface: '#151e30',
  ink: '#e8edf5',
  muted: '#9aa6b8',
  line: '#26324a',
  accent: '#4b86f0',
  onAccent: '#ffffff',
  accentSoft: '#1a2a4a',
  red: '#ff4d3a',
  navy: '#060b15',
  onNavy: '#ffffff',
  onNavyMuted: '#b8c3d6',
  good: '#4cc38a',
  goodSoft: '#12321f',
  warn: '#f0b450',
  warnSoft: '#3a2a10',
  chip: '#1e2a40',
  chip2: '#222d42',
  placeholder: '#6b778a',
  black: '#ffffff',
  onBlack: '#000000',
};

export const Palettes = { light, dark };

export const Fonts = {
  display: 'ArchivoBlack_400Regular',
  body: 'Archivo_400Regular',
  medium: 'Archivo_500Medium',
  semibold: 'Archivo_600SemiBold',
  bold: 'Archivo_700Bold',
  mono: 'JetBrainsMono_500Medium',
};

export const Space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const Radius = { sm: 8, md: 11, lg: 14, pill: 999 };
/** Wider than this, the app switches to the computer layout with a side menu. */
export const WideBreakpoint = 900;
export const MaxContentWidth = 1040;

type ThemeValue = { c: Palette; scheme: 'light' | 'dark' };
const ThemeContext = createContext<ThemeValue>({ c: light, scheme: 'light' });

export function ThemeProvider({ mode, children }: { mode: ThemeMode; children: ReactNode }) {
  const system = useColorScheme();
  const scheme: 'light' | 'dark' = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const value = useMemo(() => ({ c: Palettes[scheme], scheme }), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const isWeb = Platform.OS === 'web';
