import React, {useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import {getRelationships} from '../relationships'
import {getCredentials} from '../utils/credentialsRetriever'
import Relationship from '../models/relationship'
import styles from "../styles/styles";

const RelationshipsScreen = ({route,navigation}) => {
    console.log(`> RelationshipsScreen()`,route)
    const {walletName} = route.params
    console.log(`walletName: ${walletName}`)

    const relationships = getRelationships(walletName)

    const goToRel = (key) => {
        console.log(`> RelationshipsScr.pressHandler( ${key})`)
        console.log(`executing navigation.navigate() now...`)
        const creds = getCredentials(key)
        navigation.navigate(
            'Credentials',
            {
                key: key,
                creds: creds
            }
        )
    }

    const touchable = (key) => {
        // return < Text > {key} < /Text>
        return (
            <TouchableOpacity
                onPress={() => onPress(key)}
            >
                <Text style={styles.listItem}>{key}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={relationships}
                    keyExtractor={(item) => item.key}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                    <List.Item
                      title={item.key}
                      titleNumberOfLines={1}
                      titleStyle={styles.listTitle}
                      descriptionStyle={styles.listDescription}
                      descriptionNumberOfLines={1}
                      onPress={() => goToRel(item)}
                    />
                    )}
                />
            </SafeAreaView>
        </View>
    )
};

export default RelationshipsScreen