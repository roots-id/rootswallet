import React, {useEffect, useState} from 'react';
import {
    Animated,
    Text,
    Pressable,
    View,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useCardAnimation} from '@react-navigation/stack';
import {IconButton, ToggleButton} from 'react-native-paper';
import {styles} from "../styles/styles";

import * as roots from '../roots'
import {CompositeScreenProps} from "@react-navigation/core/src/types";

export default function SettingsScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [demoMode, setDemoMode] = useState<boolean>(roots.isDemo())
    const [host, setHost] = useState<string>(roots.getPrismHost());
    const {current} = useCardAnimation();

    useEffect(() => {
        roots.setPrismHost(host)
    }, [host]);

    useEffect(() => {
        roots.setDemo(demoMode)
    }, [demoMode]);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Pressable
                style={styles.pressable}
                onPress={navigation.goBack}
            />
            <Animated.View
                style={styles.viewAnimated}
            >
                <View style={{flexDirection: 'row',}}>
                    <IconButton
                        icon="chemical-weapon"
                        size={36}
                        color="#e69138"
                        onPress={() => navigation.navigate("Developer")}
                    />
                    <IconButton
                        icon="close-circle"
                        size={36}
                        color="#e69138"
                        onPress={() => navigation.goBack()}
                    />
                </View>
                <Text style={styles.listItemCenteredBlack}>Select Prism Node:</Text>
                <View style={{backgroundColor: '#251520', width: "80%"}}>
                    <Picker
                        style={styles.clickableListTitle}
                        mode="dropdown"
                        dropdownIconColor="#e69138"
                        numberOfLines={5}
                        selectedValue={host}
                        onValueChange={(itemValue) => setHost(itemValue)}>
                        <Picker.Item label="Local Test Node" value="ppp-node-test.atalaprism.io"/>
                        <Picker.Item label="Prism Test Node" value="ppp.atalaprism.io"/>
                    </Picker>
                </View>
                <View style={{flexDirection: 'row',}}>
                    <Text style={styles.listItemCenteredBlack}>Toggle Demo Mode:</Text>
                    <ToggleButton
                        icon={demoMode ? "toggle-switch" : "toggle-switch-off-outline"}
                        size={26}
                        color="#e69138"
                        value="toggle demo switch"
                        onPress={() => setDemoMode(!roots.isDemo())}
                    />
                </View>
            </Animated.View>
        </View>
    );
}
