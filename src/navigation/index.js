import React from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import Routes from './Routes';

//<AuthProvider>
//</AuthProvider>
export default function Providers() {
  return (
      <PaperProvider theme={theme}>
          <Routes />
      </PaperProvider>
  );
}

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e69138',
    accent: '#b0bf93',
    background: '#f9f9f9',
  },
};
