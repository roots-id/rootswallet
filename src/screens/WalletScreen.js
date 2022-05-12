import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, NativeModules, SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { Divider, List } from 'react-native-paper';
import FormButton from '../components/FormButton';

import { getRootsWallet, TEST_WALLET_NAME} from '../roots'
import { recursivePrint } from '../utils'

import styles from "../styles/styles";

export default function WalletScreen({navigation}) {
    const [wallet, setWallet] = useState([]);

    useEffect(async () => {
        try {
            setWallet(await getRootsWallet(TEST_WALLET_NAME));
            console.log("WalletScreen - set wallet",wallet)
        } catch(error) {
            console.error("WalletScreen - Could not get roots wallet",TEST_WALLET_NAME,error,error.stack)
        }
    }, []);

    const keys = Object.keys(wallet)
    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                  <FlatList
                      data={keys}
                      keyExtractor={(item) => item}
                      ItemSeparatorComponent={() => <Divider />}
                      renderItem={({ item }) =>
                          {
                            const output = recursivePrint(wallet[item])
                            console.log(item,": ",output)
                            return <Text style={styles.listItem}>{item + ": " + output}</Text>
                          }
                      }
                  />
            </SafeAreaView>
        </View>
    );
}