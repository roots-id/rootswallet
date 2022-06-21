import React, {useEffect, useState} from 'react';
import {Button, Linking, SafeAreaView, StyleSheet, Text, TextInput, TextProps, View} from 'react-native';
import {Divider, List, Title} from 'react-native-paper';
import AuthContext from '../context/AuthenticationContext';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import Loading from '../components/Loading'
import {initRootsWallet} from '../roots'
import {createWallet, getWallet} from '../wallet'

import {displayProblem, styles} from "../styles/styles";
import {CompositeScreenProps} from "@react-navigation/core/src/types";

export default function CreateWalletScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [initialized, setInitialized] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [mnemonic, setMnemonic] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [createWalletButton, setCreateWalletButton] = useState<JSX.Element>(<Text/>);
    const [problemText, setProblemText] = useState<string>("")
    const [problem, setProblem] = useState<JSX.Element>(<Text/>)
    const [passwordsMatch, setPasswordsMatch] = useState<JSX.Element>(<Text/>)
    const [passwordAlpha, setPasswordAlpha] = useState<JSX.Element>(<Text/>)
    const [passwordNumeric, setPasswordNumeric] = useState<JSX.Element>(<Text/>)
    const [passwordLongEnough, setPasswordLongEnough] = useState<JSX.Element>(<Text/>)
    const [userName, setUserName] = useState<string>('');
    const [userNameValid, setUserNameValid] = useState<JSX.Element>(<Text/>)
    const [walletName, setWalletName] = useState<string>('');
    const [walletNameValid, setWalletNameValid] = useState<JSX.Element>(<Text/>)

    console.log("CreateWalletScreen - start")

    const {signIn} = React.useContext(AuthContext);

    useEffect(() => {
        setLoading(true)
        checkErrors();
        setLoading(false)
    }, []);

    useEffect(() => {
        checkErrors()
    }, [userName, walletName, password, confirmPassword, problemText]);

    function checkErrors() {
        const passNumeric = (/\d/.test(password))
        setPasswordNumeric(<Text style={displayProblem(!passNumeric)}>Password does not contain
            numbers</Text>)
        const prob = problemText && problemText.length > 0
        console.error("CreateWalletScreen - problem detected", problemText)
        setProblem(<Text style={displayProblem(prob)}>{problem}</Text>)
        const passAlpha = (/[a-zA-Z]/.test(password))
        console.log("password does not contain letters")
        setPasswordAlpha(<Text style={displayProblem(!passAlpha)}>Password does not contain letters</Text>)
        const passLength = password.length >= 8
        console.log("password not long enough", passLength)
        setPasswordLongEnough(<Text style={displayProblem(!passLength)}>Password is not at least 8
            characters</Text>)
        const passMatch = (password === confirmPassword)
        console.log("passwords do not match", password, confirmPassword);
        setPasswordsMatch(<Text style={displayProblem(!passMatch)}>Passwords do not match</Text>)
        const userValid = (userName && userName.length > 0)
        console.log("user name is not set", userName);
        setUserNameValid(<Text style={displayProblem(!userValid)}>User name not set</Text>)
        const walletValid = (walletName && walletName.length > 0)
        console.log("wallet name is not set", walletName);
        setWalletNameValid(<Text style={displayProblem(!walletValid)}>Wallet name not set</Text>)
        if (walletValid && userValid && passNumeric && passAlpha && passLength && passMatch) {
            setCreateWalletButton(<FormButton
                disabled={!(passwordsMatch && passwordAlpha && passwordNumeric && passwordLongEnough)}
                title="Create Wallet"
                modeValue="contained"
                labelStyle={styles.loginButtonLabel}
                onPress={async () => {
                    console.log("creating wallet", walletName, mnemonic, password)
                    try {
                        const created = await createWallet(walletName, mnemonic, password);
                        if (created) {
                            console.log("CreateWalletScreen - Wallet created")
                            const wal = getWallet(walletName)
                            if (wal) {
                                console.log("CreateWalletScreen - Got wallet, setting to initialized")
                                setInitialized(true)
                                setProblemText("")
                            }
                            console.log("CreateWalletScreen - signing in")
                            //intentionally not awaiting
                            init(userName).catch(console.error)
                            signIn(null, true);
                        } else {
                            console.error("CreateWalletScreen - Creating wallet failed");
                            setProblemText("Wallet creation failed")
                        }
                    } catch (error: any) {
                        console.error("CreateWalletScreen - Creating wallet failed", error, error.stack)
                        setProblemText(error.message)
                    }
                }}
            />)
        } else {
            setCreateWalletButton(<Text/>)
        }
    }

    function handleOpenWithLinking() {
        Linking.openURL('https://www.rootsid.com/projects/rootswallet/help');
    }

    function handleSettings() {
        console.log("handling settings")
        navigation.navigate("Settings")
    }

    async function init(userName: string) {
        setLoading(true)
        const iWal = async () => await initRootsWallet(userName)
        iWal().catch(console.error)
        setLoading(false)
    }

    if (loading) {
        return (<Loading/>)
    }

    return (
        <View style={styles.centeredContainer}>
            <Title style={styles.titleText}>Create wallet password:</Title>
            <FormInput
                labelName="Wallet Name"
                onChangeText={(wName: React.SetStateAction<string>) => setWalletName(wName)}
                placeholder={"Name your wallet"}
                secureTextEntry={false}
                value={walletName}
            />
            <FormInput
                labelName="User Name"
                onChangeText={(uName: React.SetStateAction<string>) => setUserName(uName)}
                placeholder={"Set user name"}
                secureTextEntry={false}
                value={userName}
            />
            <FormInput
                labelName="Password"
                placeholder={"Enter Password"}
                value={password}
                secureTextEntry={true}
                onChangeText={(userPassword: React.SetStateAction<string>) => setPassword(userPassword)}
            />
            <FormInput
                labelName="Confirm Password"
                placeholder={"Confirm Password"}
                value={confirmPassword}
                secureTextEntry={true}
                onChangeText={(userPassword: React.SetStateAction<string>) => setConfirmPassword(userPassword)}
            />
            {walletNameValid}
            {userNameValid}
            {passwordAlpha}
            {passwordNumeric}
            {passwordLongEnough}
            {passwordsMatch}
            {problem}
            {createWalletButton}
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
