import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {getRelationships} from '../utils/relationshipsManager'
import {getCredentials} from '../utils/credentialsRetriever'
import Relationship from '../models/relationship'
import styles from "../styles/styles";

const RelationshipsScreen = ({route,navigation}) => {
    console.log(`> RelationshipsScreen()`)
    const {walletName} = route.params
    console.log(`walletName: ${walletName}`)

    const relationships = getRelationships(walletName)

    const onPress = (key) => {
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
            <View style={{flex: 1}}>
                <Text style={styles.header}>Wallet <Text style={{color: 'blue'}}>{walletName}</Text></Text>
                <Text style={styles.leftheader}>Relationships: </Text>
                <FlatList
                    data={relationships}
                    renderItem={({item}) => touchable(item.key)}
                />
            </View>
        </View>
    )
};

export default RelationshipsScreen

