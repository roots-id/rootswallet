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
    // const [demoMode, setDemoMode] = useState<boolean>(roots.isDemo())
    const {current} = useCardAnimation();

    // useEffect(() => {
    //     roots.setPrismHost(host)
    // }, [host]);
    //
    // useEffect(() => {
    //     roots.setDemo(demoMode)
    // }, [demoMode]);

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
                    <Text style={styles.listItemCenteredBlack}>Export:</Text>
                    <IconButton
                        icon="close-circle"
                        size={36}
                        color="#e69138"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </Animated.View>
        </View>
    );
}
