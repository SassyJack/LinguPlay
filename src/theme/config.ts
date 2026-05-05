/**
 * Theme configuration and colors
 * Centralized theme definitions for light and dark modes
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;

  // Neutrals
  background: string;
  surface: string;
  surfaceVariant: string;
  onBackground: string;
  onSurface: string;

  // Semantic colors
  success: string;
  error: string;
  warning: string;
  info: string;

  // Grayscale
  black: string;
  white: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
}

export interface ThemeTypography {
  h1: { fontSize: number; fontWeight: '700' };
  h2: { fontSize: number; fontWeight: '600' };
  h3: { fontSize: number; fontWeight: '600' };
  body1: { fontSize: number; fontWeight: '400' };
  body2: { fontSize: number; fontWeight: '500' };
  caption: { fontSize: number; fontWeight: '400' };
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

const lightColors: ThemeColors = {
  primary: '#4A90D9', // Azul brillante amigable
  primaryLight: '#6FB1FC',
  primaryDark: '#3273C4',
  secondary: '#50C878', // Verde esmeralda vivo
  accent: '#FF8C42', // Naranja cálido

  background: '#FFF5E6', // Fondo crema cálido
  surface: '#FFFFFF',
  surfaceVariant: '#E8F5E9',
  onBackground: '#2C3E50',
  onSurface: '#34495E',

  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#F1C40F',
  info: '#3498DB',

  black: '#2C3E50',
  white: '#FFFFFF',
  gray100: '#FFF9F0',
  gray200: '#F0F7FF',
  gray300: '#E1F5FE',
  gray400: '#B3E5FC',
  gray500: '#81D4FA',
  gray600: '#4FC3F7',
  gray700: '#29B6F6',
  gray800: '#03A9F4',
  gray900: '#0288D1',
};

const darkColors: ThemeColors = {
  primary: '#0A84FF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D5',
  secondary: '#5AC8FA',
  accent: '#FF9500',

  background: '#000000',
  surface: '#1A1A1A',
  surfaceVariant: '#262626',
  onBackground: '#FFFFFF',
  onSurface: '#F2F2F7',

  success: '#34C759',
  error: '#FF453A',
  warning: '#FF9500',
  info: '#0A84FF',

  black: '#000000',
  white: '#FFFFFF',
  gray100: '#F9FAFB',
  gray200: '#F3F4F6',
  gray300: '#E5E7EB',
  gray400: '#D1D5DB',
  gray500: '#9CA3AF',
  gray600: '#6B7280',
  gray700: '#4B5563',
  gray800: '#1F2937',
  gray900: '#111827',
};

const typography: ThemeTypography = {
  h1: { fontSize: 32, fontWeight: '800' },
  h2: { fontSize: 28, fontWeight: '800' },
  h3: { fontSize: 22, fontWeight: '700' },
  body1: { fontSize: 18, fontWeight: '600' },
  body2: { fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 16, fontWeight: '600' },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const borderRadius = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
};

export const lightTheme: Theme = {
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
};

export const darkTheme: Theme = {
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
};
