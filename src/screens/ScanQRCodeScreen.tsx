import {useEffect, useState} from 'react';
import {
    Animated,
    View,
    Text,
    Pressable,
    Button,
    StyleSheet,
} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useTheme} from '@react-navigation/native';
import {useCardAnimation} from '@react-navigation/stack';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {getDemoCred} from "../credentials";
import {getDemoRel, YOU_ALIAS} from '../relationships';
import {getDid, importContact, importVerifiedCredential, isDemo } from '../roots'
import React from 'react';
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import {BarCodeEvent} from "expo-barcode-scanner/src/BarCodeScanner";
import {styles} from "../styles/styles";

export default function ScanQRCodeScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("Scan QR - rout params", route.params)
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const {colors} = useTheme();
    const {current} = useCardAnimation();
    const [scanned, setScanned] = useState<boolean>(false);
    const type = route.params.type

    let interval: NodeJS.Timeout;

    const handleDemo = async () => {
        if (isDemo()) {
            console.log("Scan QR - pretending to scan with demo data")
            clearInterval(interval)
            if (type === 'contact') {
                console.log("Scan QR - getting contact demo data")
                const demoData = getDemoRel()
                await importContact(demoData)
            } else {
                console.log("Scan QR - getting credential demo data")
                const did = getDid(YOU_ALIAS)
                if(did) {
                    const demoData = getDemoCred(did).verifiedCredential
                    await importVerifiedCredential(demoData)
                }
            }
            if (navigation.canGoBack()) {
                navigation.goBack()
            }
        }
    }

    useEffect(async () => {
        const {status} = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status && isDemo()) {
            interval = setInterval(handleDemo, 5000);
        }
    }, [])


    const handleBarCodeScanned = async ({data}: BarCodeEvent) => {
        console.log("Scan QR - scanned data",type,data)
        setScanned(true);
        clearInterval(interval)
        if(type == "credential") {
            await importVerifiedCredential(JSON.parse(data))
        } else if(type == "contact") {
            await importContact(JSON.parse(data))
        }
        if (navigation.canGoBack()) {
            navigation.goBack()
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting camera permission</Text>;
    }
    if (!hasPermission) {
        return <Text>No access to camera</Text>;
    }

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
                <IconButton
                    icon="close-circle"
                    size={36}
                    color="#e69138"
                    onPress={navigation.goBack}
                />
                <View style={{

                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 250,
                    height: 250,
                }}>
                    <BarCodeScanner
                        onBarCodeScanned={handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                    />
                    {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)}/>}
                </View>
            </Animated.View>
        </View>
    );
}