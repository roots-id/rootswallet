import React, {useEffect, useState} from 'react';
import {Button, Linking, SafeAreaView, StyleSheet, Text, TextInput, TextProps, View} from 'react-native';
import {Divider, List, Title} from 'react-native-paper';

import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';

import AuthContext from '../context/AuthenticationContext';
import {initRootsWallet, isDemo, TEST_WALLET_NAME} from '../roots'
import {createWallet, getWallet} from '../wallet'

import {displayProblem, styles} from "../styles/styles";
import {CompositeScreenProps} from "@react-navigation/core/src/types";

export default function CreateWalletScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [initialized, setInitialized] = useState<boolean>(false);
//  const [loading, setLoading] = useState(true);
    const [mnemonic, setMnemonic] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [walletName, setWalletName] = useState<string>(TEST_WALLET_NAME);
    const [problemDisabled, setProblemDisabled] = useState<boolean>(true)
    const [passwordsMatch, setPasswordsMatch] = useState<boolean>(false)
    const [passwordAlpha, setPasswordAlpha] = useState<boolean>(false)
    const [passwordNumeric, setPasswordNumeric] = useState<boolean>(false)
    const [passwordLongEnough, setPasswordLongEnough] = useState<boolean>(false)
    const [errorText, setErrorText] = useState(<View/>)

    console.log("CreateWalletScreen - start")

    const {signIn} = React.useContext(AuthContext);

    useEffect(() => {
            console.log("comparing passwords", password, confirmPassword);
            setPasswordsMatch(password === confirmPassword)
            console.log("do passwords match?", passwordsMatch)
            setPasswordNumeric(/[0-9]/.test(password))
            console.log("does password contain number?", passwordNumeric)
            setPasswordAlpha(/[a-zA-Z]/.test(password))
            console.log("does password contain letters?", passwordAlpha)
            setPasswordLongEnough(password.length >= 8)
            console.log("password long enough?", passwordLongEnough)
        }, [password, confirmPassword]
    );

    useEffect(() => {
        if(!problemDisabled) {
            setErrorText(<View><Text style={displayProblem(problemDisabled)}>Could not create relationship</Text></View>)
        } else if(!passwordLongEnough) {
            setErrorText(<Text style={displayProblem(passwordLongEnough)}>Password is not at least 8
                characters</Text>)
        } else if(!passwordAlpha) {
            setErrorText(<Text style={displayProblem(passwordAlpha)}>Password does not contain letters</Text>)
        } else if(!passwordNumeric) {
            setErrorText(<Text style={displayProblem(passwordNumeric)}>Password does not contain
                numbers</Text>);
        } else if(!passwordsMatch) {
            setErrorText(<Text style={displayProblem(passwordsMatch)}>Passwords do not match</Text>)
        } else {
            setErrorText(<View/>)
        }
    },[problemDisabled,passwordsMatch,passwordNumeric,passwordLongEnough,passwordAlpha])

    function handleOpenWithLinking() {
        Linking.openURL('https://www.rootsid.com/projects/rootswallet/help');
    }

    function handleSettings() {
        console.log("handling settings")
        navigation.navigate("Settings")
    }

    return (
        <View style={styles.modalContainer}>
            <Title style={styles.titleText}>Create wallet password:</Title>
            <FormInput
                labelName="Wallet Name"
                value={walletName}
                secureTextEntry={false}
                disabled={true}
            />
            <FormInput
                labelName="Password"
                value={password}
                secureTextEntry={true}
                onChangeText={(userPassword: React.SetStateAction<string>) => setPassword(userPassword)}
            />
            <FormInput
                labelName="Confirm Password"
                value={confirmPassword}
                secureTextEntry={true}
                onChangeText={(userPassword: React.SetStateAction<string>) => setConfirmPassword(userPassword)}
            />
            {errorText}
            <FormButton
                disabled={!(passwordsMatch && passwordAlpha && passwordNumeric && passwordLongEnough)}
                title="Create Wallet"
                modeValue="contained"
                labelStyle={styles.loginButtonLabel}
                onPress={async () => {
                    console.log("creating wallet", walletName, mnemonic, password)
                    const created = await createWallet(walletName, mnemonic, password);
                    if (created) {
                        console.log("CreateWalletScreen - Wallet created")
                        const wal = getWallet(TEST_WALLET_NAME)
                        if (wal) {
                            console.log("CreateWalletScreen - Got wallet, setting to initialized")
                            setInitialized(true)
                            setProblemDisabled(true)
                        }
                        console.log("CreateWalletScreen - signing in")
                        //intentionally not awaiting
                        initRootsWallet()
                        signIn(null, true);
                    } else {
                        console.log("CreateWalletScreen - Creating wallet failed");
                        setProblemDisabled(false)
                    }
                }}
            />
            <Text></Text>
            <View style={{backgroundColor: '#251520',flex:1,flexDirection:"row",
                justifyContent:'space-between', marginBottom: 10,width: '90%',
                maxWidth: 400,}}>
                <View style={{flex:1, marginRight: 10,marginLeft: 10}}>
                    <Button
                        title="Need Help?"
                        onPress={handleOpenWithLinking}
                        color={'#251520'}
                    />
                </View>
                <View style={{backgroundColor: '#251520',flex:1, marginLeft: 5, marginRight: 10}}>
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

