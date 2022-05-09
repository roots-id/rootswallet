import React, {useState} from 'react';
import {FlatList, Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import {getRelationships} from '../relationships'
import Relationship from '../models/relationship'
import { getChatsByRel } from '../roots'
import styles from "../styles/styles";

const RelationshipsScreen = ({route,navigation}) => {
    console.log(`> RelationshipsScreen()`,route)
    const {walletName} = route.params
    console.log(`walletName: ${walletName}`)

    const relationships = getRelationships(walletName).filter(rel => rel.displayName !== 'You')

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
                              titleStyle={styles.listTitle}
                              descriptionStyle={styles.listDescription}
                              descriptionNumberOfLines={1}
                              onPress={() => navigation.navigate('Chat', { chatId: getChatsByRel(item.id)[0] })}
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