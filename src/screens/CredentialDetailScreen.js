import React from 'react';
import {Button, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import styles from "../styles/styles";
// const { PrismModule } = NativeModules;


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

const CredentialDetailsScreen = ({navigation}) => {
    console.log(`>CredDetailsScreen:  navigation: ${navigation}`)

    console.log(`navigation: ${JSON.stringify(navigation)}`)

    const {params} = navigation.state
    console.log(`> CredDetailScr(): ${JSON.stringify(params)} `)

    const pressHandler = () => {
	    navigation.goBack()
    }
    return (
        <View>
            <Text style={styles.header}>Credential:  <Text style={styles.highlightedItem}>{params.key}</Text></Text>
            <Text >{params.credential.key} : {params.credential.value}</Text>
	    {/*<Button title="Return" onPress={pressHandler} />*/}
        </View>
    )
};

export default CredentialDetailsScreen;

