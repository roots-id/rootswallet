import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import {styles} from "../styles/styles";

export default function Loading() {
  return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5b3a70" />
      </View>
  );
}
