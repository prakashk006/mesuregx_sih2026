export const COLORS = {
  primary: '#084F8A',       // Main Govt Blue
  primaryDark: '#0A3D6B',   // Dark Header Blue
  primaryLight: '#E8F1FF',  // Light Blue accents / chips / active filters
  background: '#F5F7FA',    // Light Enterprise Canvas Background
  surface: '#FFFFFF',       // Card Surfaces
  textPrimary: '#1F2937',   // Slate 800 dark text
  textSecondary: '#64748B', // Slate 500 secondary text
  textMuted: '#94A3B8',     // Slate 400 muted text
  border: '#E2E8F0',        // Soft border color
  success: '#16A34A',       // Green
  successBg: '#DCFCE7',
  warning: '#F59E0B',       // Amber / Orange
  warningBg: '#FEF3C7',
  error: '#DC2626',         // Red
  errorBg: '#FEE2E2',
  info: '#2563EB',          // Royal Blue
  infoBg: '#DBEAFE',
  white: '#FFFFFF',
};

export const TYPOGRAPHY = {
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};
