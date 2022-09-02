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

export default function SettingsScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [demoMode, setDemoMode] = useState<boolean>(roots.isDemo())
    const [host, setHost] = useState<string>(roots.getPrismHost());
    const [mediator, setMediator] = useState<string>();
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
                </View>
                <Text/>
                <View style={{flexDirection: 'row'}}>
                    <Text style={styles.listItemCenteredBlack}>Mediator: </Text>
                    <View style={{backgroundColor: '#251520', width: "80%"}}>
                        <Picker
                            style={styles.clickableListTitle}
                            mode="dropdown"
                            dropdownIconColor="#e69138"
                            numberOfLines={5}
                            selectedValue={host}
                            onValueChange={(itemValue) => setMediator(itemValue)}>
                            <Picker.Item label="Roots Test Mediator" value="https://mediator.rootsid.cloud/oob_url"/>
                        </Picker>
                    </View>
                </View>
                <Text />
                <View style={{flexDirection: 'row',}}>
                    <Text style={styles.listItemCenteredBlack}>Demo Mode ON/OFF: </Text>
                    <ToggleButton
                        icon={demoMode ? "toggle-switch" : "toggle-switch-off-outline"}
                        size={26}
                        color="#e69138"
                        value="toggle demo switch"
                        onPress={() => setDemoMode(!roots.isDemo())}
                    />
                </View>
                <Text/>
                <View style={{flexDirection: 'row',}}>
                    <FormButton
                        title="Save/Restore Wallet"
                        modeValue="contained"
                        labelStyle={styles.loginButtonLabel}
                        onPress={() => navigation.navigate("Save")}/>
                </View>
                <Text/>
                <View style={{flexDirection: 'row',}}>
                    <FormButton
                        title="Developers Only"
                        modeValue="contained"
                        labelStyle={styles.loginButtonLabel}
                        onPress={() => navigation.navigate("Developers")}
                    />
                </View>
            </Animated.View>
        </View>
    );
}
