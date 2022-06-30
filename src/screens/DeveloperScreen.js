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
                title={"CommunicationsScreen"}
                onPress={() => props.navigation.navigate("Communications")}
            />
            <Button
                title={"Show Wallet"}
                onPress={() => props.navigation.navigate("Wallet")}
            />
        </View>
    )
};

export default DeveloperScreen;
