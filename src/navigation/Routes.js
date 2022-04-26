import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AuthStack from './AuthStack'

export default function Routes() {
  console.log("Routes - navigation/Routes")

  return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
  );
}
