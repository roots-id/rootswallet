import React, {useEffect, useState} from 'react';
import {FlatList, Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import {
    addRefreshTrigger,
    credLogo,
    decodeCredential,
    getCredDetails,
    getImportedCreds,
    hasNewCreds
} from '../credentials'
import * as models from '../models'
import * as roots from '../roots'
import styles from "../styles/styles";

const CredentialsScreen = ({route ,navigation}) => {
    console.log("creds screen - params",route.params)
    const {walletName} = route.params
    const [refresh,setRefresh] = useState(true)
    const emptyCredDeets: models.credentialDetails[] = []
    const [creds,setCreds] = useState(emptyCredDeets)

    useEffect(() => {
        addRefreshTrigger(()=>{
            console.log("creds screen - toggling refresh")
            const iCreds = getImportedCreds(roots.getRootsWallet(walletName))
            console.log("creds screen - got imported creds",iCreds.length)
            const credDeets = iCreds.map((encodedCred) => {
                return getCredDetails(encodedCred.verifiedCredential)
            })
            console.log("creds screen - got cred deets",credDeets.length)
            setCreds(credDeets);
            console.log("creds screen - set creds size",creds.length)
            setRefresh(!refresh)
        })
        hasNewCreds()
    },[])

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={creds}
                    extraData={refresh}
                    keyExtractor={(item) => item.hash}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                    <React.Fragment>
                        <View style={{flex: 1,flexDirection:'row',}}>
                            <SafeAreaView>
                            <TouchableOpacity onPress={() => roots.showCred(navigation,item.hash)}>
                                <Image source={credLogo}
                                    style={{
                                      width:65,
                                      height:75,
                                      resizeMode:'contain',
                                      margin:8
                                    }}
                                />
                            </TouchableOpacity>
                            </SafeAreaView>
                            <SafeAreaView style={styles.container}>
                            <List.Item
                              title={item.decoded.credentialSubject.name}
                              titleNumberOfLines={1}
                              titleStyle={styles.clickableListTitle}
                              descriptionStyle={styles.listDescription}
                              descriptionNumberOfLines={1}
                              onPress={() => navigation.navigate('Credential Details', { cred: item})}
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