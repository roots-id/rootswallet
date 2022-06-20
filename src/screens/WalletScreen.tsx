import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, View, Text } from 'react-native';
import { Divider } from 'react-native-paper';

import * as models from '../models'
import { TEST_WALLET_NAME } from '../roots'
import { getWallet } from '../wallet'
import { recursivePrint } from '../utils'

import {styles} from "../styles/styles";
import {CompositeScreenProps} from "@react-navigation/core/src/types";

export default function WalletScreen({ route, navigation }: CompositeScreenProps<any, any>) {
    const [wallet, setWallet] = useState<models.wallet>();

    useEffect(() => {
        try {
            setWallet(getWallet(TEST_WALLET_NAME));
            console.log("WalletScreen - set wallet",wallet)
        } catch(error: any) {
            console.error("WalletScreen - Could not get roots wallet",TEST_WALLET_NAME,error,error.stack)
        }
    }, []);

    if(wallet) {
        const keys = Object.keys(wallet)
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.container}>
                    <FlatList
                        data={keys}
                        keyExtractor={(item) => item}
                        ItemSeparatorComponent={() => <Divider/>}
                            renderItem={({item}) => {
                                const output = recursivePrint((wallet as any)[item])
                                console.log(item, ": ", output)
                                return <Text style={styles.listItem}>{item + ": " + output}</Text>
                            }
                        }
                    />
                </SafeAreaView>
            </View>
        );
    }

    return (<Text style={styles.problem}>{"No wallet found"}</Text>)
}
