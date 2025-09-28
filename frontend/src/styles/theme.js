import { createTheme } from '@mui/material/styles';

const urbanTheme = createTheme({
  palette: {
    mode: 'dark', // Base for a sleek, modern look
    primary: {
      main: '#00e5ff', // A vibrant electric cyan/blue
      light: '#69f0ae', // A bright electric green
    },
    secondary: {
      main: '#ff3d00', // A bold, energetic orange
    },
    background: {
      default: '#121212', // Deep dark background
      paper: '#1e1e1e',   // Slightly lighter surface
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none', // Buttons with normal case text often look more modern
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners for a softer, more modern feel
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25, // Pill-shaped buttons
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default gradient. Solid colors look more urban.
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
  components: {
    MuiQRCode: {
      styleOverrides: {
        root: {
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 2,
          padding: 1,
          backgroundColor: 'white'
        }
      }
    }
  },
});

export default urbanTheme;