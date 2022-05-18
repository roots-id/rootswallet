import React, {useEffect, useState} from 'react';
import {FlatList, Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import {getRelationships, addRefreshTrigger, showRel, YOU_ALIAS,
    PRISM_BOT, ROOTS_BOT} from '../relationships'
import Relationship from '../models/relationship'
import { getChatItem } from '../roots'
import styles from "../styles/styles";

const RelationshipsScreen = ({route,navigation}) => {
    console.log("rel screen - params",route.params)
    const {walletName} = route.params
    const [refresh,setRefresh] = useState(true)
    const [rels,setRels] = useState([])

    useEffect(() => {
        setRels(
            getRelationships(walletName).filter(rel => rel.displayName !== PRISM_BOT && rel.displayName !== ROOTS_BOT)
        )
        addRefreshTrigger(()=>{
            console.log("toggling refresh")
            setRefresh(!refresh)
            setRels(
                getRelationships(walletName).filter(rel => rel.displayName !== PRISM_BOT && rel.displayName !== ROOTS_BOT)
            )
        })
    },[])

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={rels}
                    extraData={refresh}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                    <React.Fragment>
                        <View style={{flex: 1,flexDirection:'row',}}>
                            <SafeAreaView>
                            <TouchableOpacity onPress={() => showRel(navigation,item.id)}>
                                <Image source={item.displayPictureUrl}
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
                              title={item.displayName}
                              titleNumberOfLines={1}
                              titleStyle={styles.clickableListTitle}
                              descriptionStyle={styles.listDescription}
                              descriptionNumberOfLines={1}
                              onPress={() => navigation.navigate('Chat', { chatId: getChatItem(item.id).id })}
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

export default RelationshipsScreen