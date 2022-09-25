import React, {useEffect, useState} from 'react';
import {FlatList, Image, SafeAreaView, View, TouchableOpacity} from 'react-native';
import {Divider, List} from 'react-native-paper';
import {
    addRefreshTrigger,
    credLogo,
    decodeCredential,
    getImportedCreds, getIssuedCreds,
    hasNewCred, isIssuedCred, issuedCredLogo
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

    function renderCredRow(cred: credential) {

        const avatar =
            <SafeAreaView>
            <TouchableOpacity
            onPress={() => roots.showCred(navigation, cred.verifiedCredential.proof.hash)}>
            <Image source={isIssuedCred(cred) ? issuedCredLogo : credLogo}
                   style={styles.credLogoStyle}
            />
            </TouchableOpacity>
            </SafeAreaView>

        const listItem =
            <SafeAreaView style={styles.container}>
            <List.Item
                title={utils.getObjectField(decodeCredential(cred.verifiedCredential.encodedSignedCredential).credentialSubject, "name")}
                titleNumberOfLines={1}
                titleStyle={styles.clickableListTitle}
                descriptionStyle={styles.listDescription}
                descriptionNumberOfLines={1}
                onPress={() => navigation.navigate('Credential Details', {cred: cred})}
            />
            </SafeAreaView>

        const issued = isIssuedCred(cred)
        const first =  issued ? listItem : avatar
        const second = issued ? avatar : listItem

        const fragment = (
            <React.Fragment>
                <View style={{flex: 1, flexDirection: 'row',}}>
                    {first}
                    {second}
                </View>
            </React.Fragment>
        )
        return fragment
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={creds}
                    extraData={refresh}
                    keyExtractor={(item) => item.verifiedCredential.proof.hash}
                    ItemSeparatorComponent={() => <Divider/>}
                    renderItem={({item}) => renderCredRow(item)}
                />
            </SafeAreaView>
        </View>
    )
};

export default CredentialsScreen
