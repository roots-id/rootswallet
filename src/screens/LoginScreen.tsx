import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Title} from 'react-native-paper';

import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';

import AuthContext from '../context/AuthenticationContext';

import {loadAll, TEST_WALLET_NAME} from '../roots'
import {displayProblem, styles} from "../styles/styles";

export default function LoginScreen({}) {
    const [password, setPassword] = useState<string>('');
    const [problemText, setProblemText] = useState<string>("")
    const [error, setError] = useState<JSX.Element>(<Text/>)

    console.log("LoginScreen - Assuming we have a wallet, trying to login in with password")

    const {signIn} = React.useContext(AuthContext);

    useEffect(() => {
        if (problemText.length > 0) {
            setError(<Text style={displayProblem(true)}>{problemText}</Text>)
        } else {
            setError(<Text/>)
        }
    }, [problemText])

    return (
        <View style={styles.centeredContainer}>
            <Title style={styles.titleText}>Login:</Title>
            <FormInput
                labelName="Wallet Name"
                value={TEST_WALLET_NAME}
                secureTextEntry={false}
                disabled={true}
            />
            <FormInput
                labelName="Wallet Password"
                value={password}
                secureTextEntry={true}
                onChangeText={(userPassword: string) => setPassword(userPassword)}
            />
            {error}
            <FormButton
                title="Login"
                modeValue="contained"
                labelStyle={styles.loginButtonLabel}
                onPress={async () => {
                    console.log("LoginScreen - Logging in with password", password)
                    //TODO get rid of TEST_WALLET_NAME
                    const probText = await loadAll(TEST_WALLET_NAME, password)
                    setProblemText(probText)
                    if (probText.length <= 0) {
                        console.log("LoginScreen - login with password success")
                        signIn(TEST_WALLET_NAME);
                    } else {
                        console.error("LoginScreen - login with password failed")
                    }
                }}
            />
        </View>
    );
}
