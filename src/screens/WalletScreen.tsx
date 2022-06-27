import React, {useEffect, useState} from 'react';
import {FlatList, SafeAreaView, View, Text} from 'react-native';
import {Divider} from 'react-native-paper';
import * as models from '../models'
import * as wallet from '../wallet'
import {recursivePrint} from '../utils'

import {styles} from "../styles/styles";
import {CompositeScreenProps} from "@react-navigation/core/src/types";

export default function WalletScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [wal,setWal] = useState<models.wallet>()

    useEffect(() => {
        setWal(wallet.getWallet())
    }, []);

    if (wal) {
        const keys = Object.keys(wal)
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.container}>
                    <FlatList
                        data={keys}
                        keyExtractor={(item) => item}
                        ItemSeparatorComponent={() => <Divider/>}
                        renderItem={({item}) => {
                            const output = recursivePrint((wal as any)[item])
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
