import React from 'react';
import {Button, NativeModules, View} from 'react-native';
import * as store from '../store'
import {initRoot} from "../roots";
import {generateIdFromName} from "../relationships";

const DeveloperScreen = (props) => {
    console.log(props.navigation)
    return (
        <View>
            <Button
                title={"Atala Prism Dev Screen"}
                onPress={() => props.navigation.navigate("Atala Prism Dev")}
            />
            <Button
                title={"Clear Storage"}
                onPress={() => store.clearStorage()}
            />
            <Button
                title={"Communications Screen"}
                onPress={() => props.navigation.navigate("Communications")}
            />
            <Button
                title={"Mediator Screen"}
                onPress={() => props.navigation.navigate("Mediator")}
            />
            <Button
                title={"Sidetree Screen"}
                onPress={() => props.navigation.navigate("Sidetree")}
            />
            <Button
                title={"Current Wallet"}
                onPress={() => props.navigation.navigate("Wallet")}
            />
            <Button
                title={"Request Credential"}
                onPress={() => props.navigation.navigate("RequestCredential")}
            />
        </View>
    )
};

export default DeveloperScreen;
