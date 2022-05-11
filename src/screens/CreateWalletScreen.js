import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Title } from 'react-native-paper';

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
  const [walletName, setWalletName] = useState(TEST_WALLET_NAME);
  const [problemDisabled, setProblemDisabled] = useState(true)
  console.log("CreateWalletScreen - start")

  const { signIn } = React.useContext(AuthContext);

//  if (loading) {
//    return <Loading />;
//  }

//  useEffect(async () => {
//    try {
//
//    } catch(error) {
//        console.error("CreateWalletScreen - Could not initialize roots",error,error.stack)
//        return(
//            <View style={styles.modalContainer}>
//                <Title style={styles.problem}>Could not initialize RootsWallet</Title>))
//                <FormButton
//                    title="Retry"
//                    modeValue="contained"
//                    labelStyle={styles.loginButtonLabel}
//                    onPress={() => setLoading(true)}
//                />
//            </View>
//        )
//    }
//  },[]);
  while(!initialized) {
      return (
          <View style={styles.modalContainer}>
            <Title style={styles.titleText}>Creating new wallet with password:</Title>
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