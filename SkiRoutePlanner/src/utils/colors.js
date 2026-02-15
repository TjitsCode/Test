/**
 * App color theme
 */

export const COLORS = {
  // Brand colors
  primary: '#1B4D89',
  primaryLight: '#2E6AB3',
  primaryDark: '#0F2D52',

  // Piste difficulty colors
  pisteBlue: '#2196F3',
  pisteRed: '#F44336',
  pisteBlack: '#212121',

  // UI colors
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EBF0F7',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#FFFFFF',
  border: '#D1D5DB',
  accent: '#FF6B35',
  success: '#4CAF50',
  warning: '#FF9800',

  // Map colors
  liftLine: '#666666',
  stopMarker: '#FF6B35',
};

export const DIFFICULTY_COLORS = {
  blue: COLORS.pisteBlue,
  red: COLORS.pisteRed,
  black: COLORS.pisteBlack,
};

export const DIFFICULTY_LABELS = {
  blue: 'Easy (Blue)',
  red: 'Intermediate (Red)',
  black: 'Expert (Black)',
};
