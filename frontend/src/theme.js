import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF',
      light: '#5E9EFF',
      dark: '#0055B3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5856D6',
      light: '#7A79E3',
      dark: '#3E3D96',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#34C759',
      light: '#5DD97A',
      dark: '#248B3E',
    },
    error: {
      main: '#FF3B30',
      light: '#FF6259',
      dark: '#B32921',
    },
    warning: {
      main: '#FF9500',
      light: '#FFAA33',
      dark: '#B36800',
    },
    info: {
      main: '#5AC8FA',
      light: '#7DD6FB',
      dark: '#3F8CAF',
    },
    background: {
      default: '#F5F5F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    h5: {
      fontWeight: 500,
      letterSpacing: '-0.005em',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '-0.005em',
    },
    subtitle1: {
      letterSpacing: '0',
    },
    subtitle2: {
      letterSpacing: '0',
    },
    body1: {
      letterSpacing: '0',
    },
    body2: {
      letterSpacing: '0',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.9)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;
