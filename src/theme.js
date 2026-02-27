export const theme = {
  colors: {
    primary: '#0a1628',
    accent: '#c8ff00',
    accentDark: '#a8d900',
    white: '#ffffff',
    offWhite: '#f4f6f8',
    gray100: '#f0f2f5',
    gray200: '#e0e4ea',
    gray400: '#9aa0ac',
    gray600: '#5a6270',
    dark: '#0a1628',
    playerBlue: '#1a73e8',
    coachPurple: '#7c3aed',
    venueOrange: '#f59e0b',
    success: '#22c55e',
    error: '#ef4444',
  },
  fonts: {
    heading: 'Georgia, serif',
    body: "'Helvetica Neue', Arial, sans-serif",
  },
  radius: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    full: '999px',
  },
  shadow: {
    sm: '0 2px 8px rgba(10,22,40,0.08)',
    md: '0 4px 20px rgba(10,22,40,0.12)',
    lg: '0 8px 40px rgba(10,22,40,0.18)',
  },
};

export const roleColors = {
  player: '#1a73e8',
  coach: '#7c3aed',
  venue: '#f59e0b',
};

export const roleLabels = {
  player: 'Player',
  coach: 'Coach',
  venue: 'Venue',
};

export const globalStyles = {
  container: {
    fontFamily: theme.fonts.body,
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: theme.colors.offWhite,
    minHeight: '100vh',
  },
  bottomNav: {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    maxWidth: '480px',
    backgroundColor: theme.colors.primary,
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0 16px 0',
    zIndex: 100,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '3px',
  },
  navIcon: {
    fontSize: '22px',
  },
  navLabel: {
    fontSize: '10px',
    color: theme.colors.gray400,
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  navLabelActive: {
    fontSize: '10px',
    color: theme.colors.accent,
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 'bold',
  },
};
