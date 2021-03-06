import React from 'react';
import {Button, View} from 'react-native';
import * as store from '../store'

const DeveloperScreen = (props) => {
    console.log(props.navigation)
    return (
        <View>
            <Button
                title={"Clear Storage"}
                onPress={() => store.clearStorage()}
            />
            <Button
                title={"Communications Screen"}
                onPress={() => props.navigation.navigate("Communications")}
            />
            <Button
                title={"Current Wallet"}
                onPress={() => props.navigation.navigate("Wallet")}
            />
            <Button
                title={"Export Wallet"}
                onPress={() => props.navigation.navigate("Export")}
            />
        </View>
    )
};

export default DeveloperScreen;
