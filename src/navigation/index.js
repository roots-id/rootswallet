import { DefaultTheme } from 'react-native-paper';

import Routes from './Routes';
import React from "react";

export default function Providers() {
  console.log("navigation - setting up providers")
  return (
            <Routes/>
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
