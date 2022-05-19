import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import Hyperlink from 'react-native-hyperlink'
import { Divider, List, Title } from 'react-native-paper';

import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import Loading from '../components/Loading';

import * as SecureStore from 'expo-secure-store';

import AuthContext from '../context/AuthenticationContext';
import { createWallet, initRootsWallet, storageStatus, TEST_WALLET_NAME } from '../roots'

import styles from "../styles/styles";

export default function CreateWalletScreen({ navigation }) {
  const [initialized,setInitialized] = useState(false);
//  const [loading, setLoading] = useState(true);
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletName, setWalletName] = useState(TEST_WALLET_NAME);
  const [problemDisabled, setProblemDisabled] = useState(true)
  console.log("CreateWalletScreen - start")

  const { signIn } = React.useContext(AuthContext);

  while(!initialized) {
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
                onChangeText={(userPassword) => setPassword(userPassword)}
            />
            <FormInput
                labelName="Confirm Password"
                value={confirmPassword}
                secureTextEntry={true}
                onChangeText={(userPassword) => setConfirmPassword(userPassword)}
            />
            <Text disable={problemDisabled} style={displayProblem(problemDisabled)}>Could not create wallet</Text>
            <FormButton
                title="Create Wallet"
                modeValue="contained"
                labelStyle={styles.loginButtonLabel}
                onPress={async () => {
                  const created = await createWallet(walletName,mnemonic,password);
                  if(created) {
                    console.log("CreateWalletScreen - Wallet created")
                    setProblemDisabled(true)
                    setInitialized(await initRootsWallet())
                    signIn(null,true);
                  } else {
                    console.log("CreateWalletScreen - Creating wallet failed");
                    setProblemDisabled(false)
                  }
                }}
            />
            <Divider />
            <View>
              <Hyperlink linkStyle={ { color: '#2980b9', fontSize: 20 } }
                linkText={ url => url === 'https://rootswallet.com/help' ? 'Need help?' : url }>
                <Text style={ { fontSize: 15 } }>
                    https://rootswallet.com/help
                </Text>
              </Hyperlink>
            </View>
          </View>
      );
   }
}

function displayProblem(problemDisabled) {
    if(problemDisabled){
        return styles.none
    }
    else{
        return styles.problem
    }
}