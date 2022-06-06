import RelRow from '../components/RelRow'
import React, {useEffect, useState} from 'react';
import {FlatList, Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import {
    getRelationships, addRefreshTrigger, showRel, YOU_ALIAS,
    PRISM_BOT, ROOTS_BOT, hasNewRels
} from '../relationships'
import Relationship from '../models/relationship'
import {getChatItem, isDemo} from '../roots'
import {styles} from "../styles/styles";
import {BarCodeScanner} from "expo-barcode-scanner";

const RelationshipsScreen = ({route,navigation}) => {
    console.log("rel screen - params",route.params)
    const {walletName} = route.params
    const [refresh,setRefresh] = useState(true)
    const [contacts,setContacts] = useState([])

    useEffect(() => {
        addRefreshTrigger(()=>{
            console.log("contacts screen - toggling refresh")
            setContacts(
                getRelationships(walletName).filter(rel => rel.displayName !== PRISM_BOT && rel.displayName !== ROOTS_BOT)
            )
            setRefresh(!refresh)
            console.log("contacts screen - contacts size",contacts.length)
        })
        hasNewRels()
    },[])

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={contacts}
                    extraData={refresh}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                    <React.Fragment>
                        <View style={{flex: 1,flexDirection:'row',}}>
                            <RelRow rel={item} nav={navigation} />
                        </View>
                    </React.Fragment>
                    )}
                />
            </SafeAreaView>
        </View>
    )
};

export default RelationshipsScreen