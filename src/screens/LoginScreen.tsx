import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Title } from 'react-native-paper';

import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';

import AuthContext from '../context/AuthenticationContext';

import { loadAll, TEST_WALLET_NAME } from '../roots'
import { displayProblem, styles } from "../styles/styles";

export default function LoginScreen({ }) {
  const [password, setPassword] = useState<string>('');
  const [problemDisabled, setProblemDisabled] = useState<boolean>(true)
  console.log("LoginScreen - Assuming we have a wallet, trying to login in with password")

  const { signIn } = React.useContext(AuthContext);

  return (
      <View style={styles.modalContainer}>
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
        <Text disable={problemDisabled} style={displayProblem(problemDisabled)}>Login Failed</Text>
        <FormButton
            title="Login"
            modeValue="contained"
            labelStyle={styles.loginButtonLabel}
            onPress={async () => {
              console.log("LoginScreen - Logging in with password",password)
              //TODO get rid of TEST_WALLET_NAME
              const wal = await loadAll(TEST_WALLET_NAME,password)
              if(wal) {
                console.log("LoginScreen - login with password success")
                setProblemDisabled(true)
                signIn(wal);
              } else {
                console.log("LoginScreen - login with password failed")
                setProblemDisabled(false)
              }
            }}
        />
      </View>
  );
}