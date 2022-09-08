import React, {useEffect, useState} from 'react';
import {Button, Image, Linking, Text, View} from 'react-native';
import {Title} from 'react-native-paper';

import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';

import AuthContext from '../context/AuthenticationContext';

import {loadAll} from '../roots'
import {displayOrHide, styles} from "../styles/styles";
import {getWalletName} from "../wallet";
import {brandLogo} from "../relationships";
import {CompositeScreenProps} from "@react-navigation/core/src/types";

export default function LoginScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [password, setPassword] = useState<string>('');
    const [problemText, setProblemText] = useState<string>("")
    const [error, setError] = useState<JSX.Element>(<Text/>)

    console.log("LoginScreen - Assuming we have a wallet, trying to login in with password")

    const {signIn} = React.useContext(AuthContext);

    function handleOpenWithLinking() {
        Linking.openURL('https://www.rootsid.com/projects/rootswallet/help');
    }

    function handleSettings() {
        console.log("handling settings")
        navigation.navigate("Settings")
    }

    useEffect(() => {
        if (problemText.length > 0) {
            setError(<Text style={displayOrHide(true,styles.problem)}>{problemText}</Text>)
        } else {
            setError(<Text/>)
        }
    }, [problemText])

    return (
        <View style={styles.centeredContainer}>
            <Image
                style={{ width: 150, height: 150 }}
                source={brandLogo}
            />
            <Title style={styles.titleText}>Login:</Title>
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
                    const walName = getWalletName();
                    if(walName) {
                        const probText = await loadAll(walName, password)
                        setProblemText(probText)
                        if (probText.length <= 0) {
                            console.log("LoginScreen - login with password success")
                            signIn(getWalletName(),true);
                        } else {
                            console.error("LoginScreen - login with password failed")
                        }
                    }
                }}
            />
            <Text></Text>
            <View style={{
                backgroundColor: '#251520', flex: 1, flexDirection: "row",
                justifyContent: 'space-between', marginBottom: 10, width: '90%',
                maxWidth: 400,
            }}>
                <View style={{flex: 1, marginRight: 10, marginLeft: 10}}>
                    <Button
                        title="Need Help?"
                        onPress={handleOpenWithLinking}
                        color={'#251520'}
                    />
                </View>
                <View style={{backgroundColor: '#251520', flex: 1, marginLeft: 5, marginRight: 10}}>
                    <Button
                        title="Settings"
                        onPress={handleSettings}
                        color={'#251520'}
                    />
                </View>
            </View>
        </View>
    );
}
