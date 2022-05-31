import React, {useEffect, useState} from 'react';
import {FlatList, Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import { addRefreshTrigger, credLogo, decodeCredential, getCredDetails, showCred} from '../credentials'
import { getImportedCredentials, getChatItem } from '../roots'
import styles from "../styles/styles";

const CredentialsScreen = ({route,navigation}) => {
    console.log("creds screen - params",route.params)
    const {walletName} = route.params
    const [refresh,setRefresh] = useState(true)
    const [creds,setCreds] = useState([])

    function loadCreds() {
        const credObjs = []
        getImportedCredentials().forEach((encodedCred) => {
            credObjs.push(getCredDetails(encodedCred.verifiedCredential))
        })
        console.log("cred screen - setting creds",credObjs.length)
        return credObjs;
    }

    useEffect(() => {
        setCreds(loadCreds())
        addRefreshTrigger(()=>{
            console.log("creds screen - toggling refresh")
            setRefresh(!refresh)
            setCreds(loadCreds())
            console.log("creds screen - Creds size",creds.length)
        })
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
                            <TouchableOpacity onPress={() => showCred(navigation,{cred: item})}>
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