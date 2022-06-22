import React from 'react';
import {Button, View} from 'react-native';
import * as store from '../store'

const HomeScreen = (props) => {
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
                title={"CredentialsScreen"}
                onPress={() => props.navigation.navigate("VCs")}
            />
            <Button
                title={"MyIdentity"}
                onPress={() => props.navigation.navigate("MyIdentity")}
            />
            <Button
                title={"Settings"}
                onPress={() => props.navigation.navigate("Settings")}
            />
            <Button
                title={"Show Wallet"}
                onPress={() => props.navigation.navigate("Wallet")}
            />
        </View>
    )
};

export default HomeScreen;
