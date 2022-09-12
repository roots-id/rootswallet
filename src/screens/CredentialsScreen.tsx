import React, {useEffect, useState} from 'react';
import {FlatList, Image, SafeAreaView, View, TouchableOpacity} from 'react-native';
import {Divider, List} from 'react-native-paper';
import {
    addRefreshTrigger,
    credLogo,
    decodeCredential,
    getImportedCreds, getIssuedCreds,
    hasNewCred
} from '../credentials'
import * as roots from '../roots'
import {styles} from "../styles/styles";
import * as wallet from '../wallet'
import {credential} from "../models";
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import * as utils from "../utils";

const CredentialsScreen = ({route, navigation}: CompositeScreenProps<any, any>) => {
    console.log("creds screen - params", route.params)
    const [refresh, setRefresh] = useState(true)
    const [creds, setCreds] = useState<credential[]>()

    useEffect(() => {
        addRefreshTrigger(() => {
            console.log("creds screen - toggling refresh")
            const wal = wallet.getWallet()
            if (wal) {
                const importedCreds = getImportedCreds(wal)
                const issuedCreds = getIssuedCreds(wal)
                setCreds(importedCreds.concat(issuedCreds))
                console.log("creds screen - got imported and issued creds", creds?.length)
                setRefresh(!refresh)
            }
        })
        hasNewCred()
    }, [])

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={creds}
                    extraData={refresh}
                    keyExtractor={(item) => item.verifiedCredential.proof.hash}
                    ItemSeparatorComponent={() => <Divider/>}
                    renderItem={({item}) => (
                        <React.Fragment>
                            <View style={{flex: 1, flexDirection: 'row',}}>
                                <SafeAreaView>
                                    <TouchableOpacity
                                        onPress={() => roots.showCred(navigation, item.verifiedCredential.proof.hash)}>
                                        <Image source={credLogo}
                                               style={styles.credLogoStyle}
                                        />
                                    </TouchableOpacity>
                                </SafeAreaView>
                                <SafeAreaView style={styles.container}>
                                    <List.Item
                                        title={utils.getObjectField(decodeCredential(item.verifiedCredential.encodedSignedCredential).credentialSubject, "name")}
                                        titleNumberOfLines={1}
                                        titleStyle={styles.clickableListTitle}
                                        descriptionStyle={styles.listDescription}
                                        descriptionNumberOfLines={1}
                                        onPress={() => navigation.navigate('Credential Details', {cred: item})}
                                    />
                                </SafeAreaView>
                            </View>
                        </React.Fragment>
                    )}
                />
            </SafeAreaView>
        </View>
    )
};

export default CredentialsScreen
