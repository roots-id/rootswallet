import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import Hyperlink from 'react-native-hyperlink'
import { Divider, List, Title } from 'react-native-paper';

import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';

import AuthContext from '../context/AuthenticationContext';
import {initRootsWallet, TEST_WALLET_NAME} from '../roots'
import {createWallet, getWallet} from '../wallet'

import { displayProblem, styles } from "../styles/styles";

export default function CreateWalletScreen() {
  const [initialized,setInitialized] = useState<boolean>(false);
//  const [loading, setLoading] = useState(true);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [walletName, setWalletName] = useState<string>(TEST_WALLET_NAME);
  const [problemDisabled, setProblemDisabled] = useState<Boolean>(true)
  console.log("CreateWalletScreen - start")

  const { signIn } = React.useContext(AuthContext);

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
              <Text disable={problemDisabled} style={displayProblem(problemDisabled)}>Could not create wallet</Text>
              <FormButton
                  title="Create Wallet"
                  modeValue="contained"
                  labelStyle={styles.loginButtonLabel}
                  onPress={async () => {
                      console.log("creating wallet", walletName, mnemonic, password)
                      const created = await createWallet(walletName, mnemonic, password);
                      if(created) {
                          console.log("CreateWalletScreen - Wallet created")
                          const wal = getWallet(TEST_WALLET_NAME)
                          if (wal) {
                              console.log("CreateWalletScreen - Got wallet, setting to initialized")
                              setInitialized(true)
                              setProblemDisabled(true)
                          }
                          console.log("CreateWalletScreen - signing in")
                          //dont await
                          initRootsWallet()
                          signIn(null, true);
                      } else {
                          console.log("CreateWalletScreen - Creating wallet failed");
                          setProblemDisabled(false)
                      }
                  }}
              />

              <View>
                  <Text></Text>
                  <Hyperlink linkStyle={{color: '#2980b9', fontSize: 20}}
                             linkText={url => url === 'https://rootswallet.com/help' ? 'Need help?' : url}>
                      <Text style={{fontSize: 15}}>
                          https://rootswallet.com/help
                      </Text>
                  </Hyperlink>
              </View>
          </View>
      );
}