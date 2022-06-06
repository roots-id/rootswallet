import React, {useEffect, useState} from 'react';
import {FlatList, Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Divider, List } from 'react-native-paper';
import { showRel } from '../relationships'
import Relationship from '../models/relationship'
import { getChatItem } from '../roots'
import {styles} from "../styles/styles";

export default function RelRow(...props) {

    const item = props[0]["rel"]
    const navigation = props[0]["nav"]

    function getContactName(contact) {
        if(contact.startsWith("You")) {
            return "Your History"
        } else {
            return contact
        }
    }

  return (
  <React.Fragment>
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
          title={getContactName(item.displayName)}
          titleNumberOfLines={1}
          titleStyle={styles.clickableListTitle}
          descriptionStyle={styles.listDescription}
          descriptionNumberOfLines={1}
          onPress={() => navigation.navigate('Chat', { chatId: getChatItem(item.id).id })}
        />
        </SafeAreaView>
    </React.Fragment>
  );
}
