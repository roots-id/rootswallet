import React, {useEffect, useState} from 'react';
import {
    Animated,
    Text,
    Pressable,
    View, Button,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useCardAnimation} from '@react-navigation/stack';
import {IconButton, ToggleButton} from 'react-native-paper';
import {styles} from "../styles/styles";

import * as roots from '../roots'
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import FormButton from "../components/FormButton";

export default function MediatorLogsScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [showMediator, setMediatorShow] = useState<boolean>(roots.isShowMediator());
    const [mediatior, setMediator] = useState<string>(roots.getMediatorURL());
    const {current} = useCardAnimation();


    useEffect(() => {
        roots.setShowMediator(showMediator)
    }, [showMediator]);

    useEffect(() => {
        roots.setMediatorURL(mediatior)
    }, [mediatior]);

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
            <View style={styles.closeButtonContainer}>
                <IconButton
                    icon="close-circle"
                    size={36}
                    color="#e69138"
                    onPress={() => navigation.goBack()}
                />
            </View>
            <Animated.View
                style={styles.viewAnimatedStart}
            >
                <Text style={[styles.titleText,styles.black]}>Settings:</Text>
                <Text />
                <View style={{flexDirection: 'row'}}>
                    <Text style={styles.listItemCenteredBlack}>Server: </Text>
                    <Text style={styles.listItemCenteredBlack}>Server: </Text>
                    <Text style={styles.listItemCenteredBlack}>Server: </Text>
                </View>
                <Text/>
            </Animated.View>
        </View>
    );
}
