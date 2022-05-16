import React, {useState} from 'react';
import {FlatList, Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import {getRelationships, YOU_ALIAS,
    PRISM_BOT, ROOTS_BOT, HISTORY_ALIAS} from '../relationships'
import Relationship from '../models/relationship'
import { getChatItem } from '../roots'
import styles from "../styles/styles";

const RelationshipsScreen = ({route,navigation}) => {
    console.log(`> RelationshipsScreen()`,route)
    const {walletName} = route.params
    console.log(`walletName: ${walletName}`)

    const relationships = getRelationships(walletName).filter(
        rel => rel.displayName !== YOU_ALIAS &&
         rel.displayName !== PRISM_BOT &&
         rel.displayName !== ROOTS_BOT &&
         rel.displayName !== HISTORY_ALIAS)

    const showRel = (rel) => {
        console.log(`> RelationshipsScr.pressHandler( ${rel})`)
        console.log(`executing navigation.navigate() now...`)
        navigation.navigate(
            'Relationship Details',
            {
                rel: rel
            }
        )
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={relationships}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                    <React.Fragment>
                        <View style={{flex: 1,flexDirection:'row',}}>
                            <SafeAreaView>
                            <TouchableOpacity onPress={() => showRel(item)}>
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