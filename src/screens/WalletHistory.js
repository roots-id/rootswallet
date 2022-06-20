import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';
import {Divider, List} from 'react-native-paper';

import Loading from '../components/Loading';

export default function WalletHistoryScreen({navigation}) {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);

    const isFocused = useIsFocused();

    useEffect(async () => {
        let isCancelled = false;
        try {
            const walletList = await getWalletHistory(TEST_WALLET_NAME);
            if (walletList) {
                setWallets(walletList.paginator.items);
                setLoading(false);
            }
        } catch (error) {
            console.error("WalletHistoryScreen - Could not getWalletHistory", error, error.stack)
        }
    }, [isFocused, loading]);

    if (loading) {
        return <Loading/>;
    } else {

        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.container}>
                    <FlatList
                        data={wallets}
                        keyExtractor={(item) => item.id.toString()}
                        ItemSeparatorComponent={() => <Divider/>}
                        renderItem={({item}) => (
                            <List.Item
                                title={item.title}
                                titleNumberOfLines={1}
                                titleStyle={styles.listTitle}
                                descriptionStyle={styles.listDescription}
                                descriptionNumberOfLines={1}
                                onPress={() => navigation.navigate('Wallet', {walletId: item.id})}
                            />
                        )}
                    />
                </SafeAreaView>
            </View>
        );
    }
}
