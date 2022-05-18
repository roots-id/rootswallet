import React, {useEffect, useState} from 'react';
import {FlatList, Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import { certLogo, getCredentials, addRefreshTrigger, showCred} from '../credentials'
import { getImportedCredentials, getChatItem } from '../roots'
import styles from "../styles/styles";

const CredentialsScreen = ({route,navigation}) => {
    console.log("creds screen - params",route.params)
    const {walletName} = route.params
    const [refresh,setRefresh] = useState(true)
    const [creds,setCreds] = useState([])
    useEffect(() => {
        setCreds(
            getImportedCredentials()
        )
        addRefreshTrigger(()=>{
            console.log("creds screen - toggling refresh")
            setRefresh(!refresh)
            setCreds(
                getImportedCredentials()
            )
            console.log("creds screen - Creds size",creds.length)
        })
    },[])

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={creds}
                    extraData={refresh}
                    keyExtractor={(item) => item.alias}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                    <React.Fragment>
                        <View style={{flex: 1,flexDirection:'row',}}>
                            <SafeAreaView>
                            <TouchableOpacity onPress={() => showCred(navigation,item.alias)}>
                                <Image source={certLogo}
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
    <Text>Cred1</Text>
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