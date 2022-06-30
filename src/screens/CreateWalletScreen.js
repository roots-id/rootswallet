import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Title } from 'react-native-paper';

import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';

import * as SecureStore from 'expo-secure-store';

import AuthContext from '../context/AuthenticationContext';
import { createWallet, storageStatus, TEST_WALLET_NAME } from '../roots'

//async function save(key, value) {
//  await SecureStore.setItemAsync(key, value);
//}
//
//async function getValueFor(key) {
//  let result = await SecureStore.getItemAsync(key);
//  if (result) {
//    alert("🔐 Here's your value 🔐 \n" + result);
//  } else {
//    alert('No values stored under that key.');
//  }
//}

//export default function LoginScreen() {
//  const [key, onChangeKey] = React.useState('Your key here');
//  const [value, onChangeValue] = React.useState('Your value here');
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.paragraph}>Save an item, and grab it later!</Text>
//      {Add some TextInput components... }
//      <Button
//        title="Save this key/value pair"
//        onPress={() => {
//          save(key, value);
//          onChangeKey('Your key here');
//          onChangeValue('Your value here');
//        }}
//      />
//
//      <Text style={styles.paragraph}>🔐 Enter your key 🔐</Text>
//      <TextInput
//        style={styles.textInput}
//        onSubmitEditing={event => {
//          getValueFor(event.nativeEvent.text);
//        }}
//        placeholder="Enter the key for the value you want to get"
//      />
//    </View>
//  );
//}
//
//const styles = StyleSheet.create({ ... });

export default function CreateWalletScreen({ navigation }) {
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [walletName, setWalletName] = useState(TEST_WALLET_NAME);
  const [problemDisabled, setProblemDisabled] = useState(true)
  console.log("CreateWalletScreen - start")

  const { signIn } = React.useContext(AuthContext);

  return (
      <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#251520',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    marginBottom: 10,
    color: '#eeeeee',
  },
  loginButtonLabel: {
    fontSize: 22,
  },
  navButtonText: {
    fontSize: 16,
  },
  none: {
      display: 'none'
  },
  problem: {
    color: 'red',
  },
});

function displayProblem(problemDisabled) {
    if(problemDisabled){
        return styles.none
    }
    else{
        return styles.problem
    }
}