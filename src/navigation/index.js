import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import Routes from './Routes';
import AgentProvider from "@aries-framework/react-hooks";
import React, {useState} from "react";
import {Agent} from "@aries-framework/core";

export default function Providers() {
  console.log("navigation - setting up providers")
  const [agent, setAgent] = useState(undefined);

  // const initializeAgent = async () => {
  //   await // initialize your agent
  //       setAgent(yourAgent)
  // }
  //
  // useEffect(() => {
  //   initializeAgent()
  // }, [])

  return (
      <AgentProvider agent={agent}>
        <PaperProvider theme={theme}>
            <Routes/>
        </PaperProvider>
      </AgentProvider>
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
