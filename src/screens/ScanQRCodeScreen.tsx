import {useEffect, useState} from 'react';
import {
    Animated,
    View,
    Text,
    Pressable,
    Button,
    StyleSheet, Image,
} from 'react-native';
import {IconButton, Title} from 'react-native-paper';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {getDemoCred} from "../credentials";
import {brandLogo, getDemoRel, getUserId} from '../relationships';
import {getDid, importContact, importVerifiedCredential, isDemo} from '../roots'
import React from 'react';
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import {BarCodeEvent} from "expo-barcode-scanner/src/BarCodeScanner";
import {styles} from "../styles/styles";

export default function ScanQRCodeScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("Scan QR - rout params", route.params)
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [scanned, setScanned] = useState<boolean>(false);
    const [timeOutId, setTimeOutId] = useState<NodeJS.Timeout>();
    const modelType = route.params.type

    const handleDemo = async () => {
        if (!scanned && isDemo()) {
            setScanned(true)
            console.log("Scan QR - pretending to scan with demo data")
            alert("No data scanned, using demo data instead.");
            if (modelType === 'contact') {
                console.log("Scan QR - getting contact demo data")
                const demoData = getDemoRel()
                await importContact(demoData)
            } else {
                console.log("Scan QR - getting credential demo data")
                const did = getDid(getUserId())
                if (did) {
                    const demoData = getDemoCred(did).verifiedCredential
                    await importVerifiedCredential(demoData)
                }
            }
        } else {
            console.log("Scan QR - Demo interval triggered, but scanned or not demo",scanned,isDemo())
        }
        clearAndGoBack()
    }

    useEffect(() => {
        const scanFunc = async () => {
            const {status} = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
            if (isDemo()) {
                setTimeOutId(setTimeout(handleDemo, 10000));
            }
        }

        scanFunc().catch(console.error)
    }, [])


    const handleBarCodeScanned = async ({type,data}: BarCodeEvent) => {
        setScanned(true);
        console.log("Scan QR - scanned data", modelType, type, data)
        const jsonData = JSON.parse(data)
        if (modelType == "credential") {
            console.log("Scan QR - Importing scanned vc",jsonData)
            await importVerifiedCredential(jsonData)
        } else if (modelType == "contact") {
            console.log("Scan QR - Importing scanned contact",jsonData)
            await importContact(jsonData)
        }
        clearAndGoBack()
    };

    const clearAndGoBack = () => {
        setScanned(true)
        if (timeOutId) clearTimeout(timeOutId)
        if (navigation.canGoBack()) navigation.goBack()
    }

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
                onPress={clearAndGoBack}
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
                style={[styles.viewAnimated,{minWidth: "90%",minHeight: "90%",flexDirection:"column"}]}
            >
                <Title style={styles.textOrange}>Scan Barcode</Title>
                <View style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                }}>
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                    />
                    {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)}/>}
                </View>
            </Animated.View>
        </View>
    );
}
