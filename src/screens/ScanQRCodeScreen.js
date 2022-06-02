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
import {getDid, handleNewData, isDemo } from '../roots'

//import styles from "../styles/styles";

export default function ScanQRCodeScreen({route, navigation}) {
    console.log("Scan QR - rout params", route.params)
    const [hasPermission, setHasPermission] = useState(null);
    const {colors} = useTheme();
    const {current} = useCardAnimation();
    const [scanned, setScanned] = useState(false);
    const type = route.params.type

    let interval;

    const handleDemo = async () => {
        if (isDemo()) {
            console.log("scan qr - pretending to scan with demo data")
            clearInterval(interval)
            setScanned(true)
            let demoData;
            if (type === 'contact') {
                console.log("scan qr - getting contact demo data")
                demoData = getDemoRel()
            } else {
                console.log("scan qr - getting credential demo data")
                demoData = getDemoCred(getDid(YOU_ALIAS))
            }
            console.log("scan qr - pretend object has keys", Object.keys(demoData))
            const jsonData = JSON.stringify(demoData)
            console.log("scan qr - pretend data is", jsonData)
            const success = await handleNewData(jsonData)
            if (success) {
                if (navigation.canGoBack()) {
                    navigation.goBack()
                }
            } else if (navigation.canGoBack()) {
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


    const handleBarCodeScanned = async ({type, data}) => {
        setScanned(true);
        clearInterval(interval)
        await handleNewData(data)
        if (navigation.canGoBack()) {
            navigation.goBack()
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting camera permission</Text>;
    }
    if (hasPermission === false) {
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
                style={[
                    StyleSheet.absoluteFill,
                    {backgroundColor: 'rgba(0, 0, 0, 0.5)'},
                ]}
                onPress={navigation.goBack}
            />
            <Animated.View
                style={{
                    padding: 16,
                    width: '90%',
                    maxWidth: 400,
                    borderRadius: 3,
                    backgroundColor: colors.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [
                        {
                            scale: current.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1],
                                extrapolate: 'clamp',
                            }),
                        },
                    ],
                }}
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
                        onBarCodeScanned={async () => {
                            (scanned ? undefined : await handleBarCodeScanned)
                        }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)}/>}
                </View>
            </Animated.View>
        </View>
    );
}