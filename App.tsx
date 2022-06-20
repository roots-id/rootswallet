//import 'react-native-gesture-handler';
import React from 'react';
import {Text, View} from 'react-native';
import {styles} from "./src/styles/styles";
import Providers from './src/navigation';

export default function App() {
  //   return (
  //       <View style={styles.container}>
  //         <Text>Open up App.tsx to start working on your app!</Text>
  //       </View>
  // );
    return (<Providers/>)
}