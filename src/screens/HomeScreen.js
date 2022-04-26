import React from 'react';
import {Button, StyleSheet, View, Text} from 'react-native';
// const { PrismModule } = NativeModules;

const HomeScreen = (props) => {
    const imageUrl = '../assets/splash.png';
    console.log(props.navigation)
    return (
        <View>
            <Button
                title={"MyIdentity"}
                onPress={() => props.navigation.navigate("MyIdentity")}
            />
            <Button
                title={"CredentialsScreen"}
                onPress={() => props.navigation.navigate("Credentials")}
            />
            <Button
                title={"CommunicationsScreen"}
                onPress={() => props.navigation.navigate("Communications")}
            />
            <Button
                title={"HelpScreen"}
                onPress={() => props.navigation.navigate("Help")}
            />
            <Button
                title={"Settings"}
                onPress={() => props.navigation.navigate("Settings")}
            />


        </View>
    )
};

const styles = StyleSheet.create({
    text: {
        fontSize: 30,
    },
})

export default HomeScreen;