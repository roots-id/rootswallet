//import 'react-native-gesture-handler';
import React from 'react';
import {Text, View} from 'react-native';
import {styles} from "./src/styles/styles";
import Providers from './src/navigation';

import AgentProvider from '@aries-framework/react-hooks'

export default function App() {
    return (<Providers/>)
}
