import React, {useState} from 'react';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import AgentProvider from "@aries-framework/react-hooks";
import Providers from './src/navigation';

export default function App() {
    console.log("app - setting up providers")
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
                <Providers/>
            </PaperProvider>
        </AgentProvider>
    )
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
