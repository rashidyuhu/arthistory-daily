export const theme = {
  colors: {
    background: '#FF7676', // Pink/coral background
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    accent: '#2C3E50',
    border: '#E0E0E0',
    countdownBackground: '#FFE5E5',
    countdownForeground: '#FF6B6B',
    countdownText: '#2C3E50',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: {
      playfair: 'PlayfairDisplay_400Regular',
      playfairBold: 'PlayfairDisplay_700Bold',
      regular: 'Helvetica Neue', // Helvetica Neue on iOS, falls back to system font on Android
    },
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      fontFamily: 'PlayfairDisplay_700Bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
      fontFamily: 'PlayfairDisplay_400Regular',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      fontFamily: 'Helvetica Neue',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      fontFamily: 'Helvetica Neue',
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      fontFamily: 'Helvetica Neue',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      fontFamily: 'Helvetica Neue',
    },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
};
