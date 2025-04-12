import { createTheme } from "@mui/material";
export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#312e81', 
          },
          background: {
            default: '#ffffff',
            paper: '#ffffff',
          },
          text:{
            primary: '#333333',
            secondary:"#666666"
          }
        }
      : {
          primary: {
            main: '#90caf9',
          },
          background: {
            default: '#1a1a1a',
            paper: '#2d2d2d',
          },
          text: {
            primary: '#ffffff', 
            secondary: '#e0e0e0'
          }
        }),
  },
  typography:{
    allVariants:{
        color:mode === 'light' ? "#333333" : "#ffffff"
    }
  }
});