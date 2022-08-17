import React, {useEffect, useState} from 'react';
import {
    Animated,
    View,
    Text,
    Pressable,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useCardAnimation} from '@react-navigation/stack';

import {IconButton, ToggleButton} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import {styles} from "../styles/styles";

export default function ShowQRCodeScreen({route, navigation}) {
    const data = route.params.qrdata
    console.log("raw qr data", data)
    const jsonData = JSON.stringify(data)
    console.log("json qr data", jsonData)
    const qrView = 1
    const textView = 2
    const [viewSelection, setViewSelection] = useState(qrView)
    const [viewIcon, setViewIcon] = useState("toggle-switch")
    const [viewOut, setViewOut] = useState(<Text>Nothing to show</Text>);
    const {colors} = useTheme();
    const {current} = useCardAnimation();

    const onButtonToggle = value => {
        setViewSelection(viewSelection === qrView ? textView : qrView);
    };

    useEffect(() => {
        switch (viewSelection) {
            case qrView:
                setViewOut(<QRCode
                    value={jsonData}
                    size={300}
                />)
                setViewIcon("toggle-switch")
                break;
            case textView:
                setViewOut(<Text>{jsonData}</Text>)
                setViewIcon("toggle-switch-off-outline")
                break;
            default:
                console.error("Unknown view", viewSelection)
                break;
        }
    }, [viewSelection]);

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
                style={styles.viewAnimated}
            >
                <View style={{flexDirection: 'row',}}>
                    <ToggleButton
                        icon={viewIcon}
                        size={26}
                        color="#e69138"
                        value="toggle view switch"
                        status={viewSelection}
                        onPress={onButtonToggle}
                    />
                </View>
                {viewOut}
            </Animated.View>
        </View>
    );
}
