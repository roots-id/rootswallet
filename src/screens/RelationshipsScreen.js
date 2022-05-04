import React, {useState} from 'react';
import {FlatList, Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import {getRelationships} from '../relationships'
import Relationship from '../models/relationship'
import styles from "../styles/styles";

const RelationshipsScreen = ({route,navigation}) => {
    console.log(`> RelationshipsScreen()`,route)
    const {walletName} = route.params
    console.log(`walletName: ${walletName}`)

    const relationships = getRelationships(walletName).filter(rel => rel.displayName !== 'You')

    const goToRel = (user) => {
        console.log(`> RelationshipsScr.pressHandler( ${user})`)
        console.log(`executing navigation.navigate() now...`)
        navigation.navigate(
            'Relationship Details',
            {
                user: user
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
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                    <React.Fragment>
                        <View style={{flex: 1,flexDirection:'row',}}>
                            <SafeAreaView>
                            <Image source={item.displayPictureUrl}
                                style={{
                                  width:65,
                                  height:75,
                                  resizeMode:'contain',
                                  margin:8
                                }}
                            />
                            </SafeAreaView>
                            <SafeAreaView style={styles.container}>
                            <List.Item
                              title={item.displayName}
                              titleNumberOfLines={1}
                              titleStyle={styles.listTitle}
                              descriptionStyle={styles.listDescription}
                              descriptionNumberOfLines={1}
                              onPress={() => goToRel(item)}
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