import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Title} from 'react-native-paper';
import {styles} from "../styles/styles";

export default function LoadingScreen() {
    console.log("Loading screen...")
    return (
        <View style={styles.container}>
            <Title style={styles.titleText}>Loading...</Title>
        </View>
    );
}
