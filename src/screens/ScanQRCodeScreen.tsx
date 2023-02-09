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
import { getDemoRel, getUserId, AVIERY_BOT, PRISMAGENT_BOT} from '../relationships';
import {getDid, importContact, importVerifiedCredential, isDemo, setMediatorURL} from '../roots'
import React from 'react';
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import {BarCodeEvent} from "expo-barcode-scanner/src/BarCodeScanner";
import {styles} from "../styles/styles";
import { decodeOOBURL } from '../protocols';
import uuid from 'react-native-uuid';



export default function ScanQRCodeScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("Scan QR - rout params", route.params)
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [scanned, setScanned] = useState<boolean>(false);
    const [timeOutId, setTimeOutId] = useState<NodeJS.Timeout>();
    const modelType = route.params.type

    const clearAndGoBack = () => {
        setScanned(true)
        if (timeOutId) clearTimeout(timeOutId)
        if (navigation.canGoBack()) navigation.goBack()
    }
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
        if (data.startsWith("http") || data.startsWith("ws")){
            console.log(data)
            if (data.toLowerCase().includes("_oobid")){
                console.log("QR CODE SMALL")
                const response = await fetch(data);
                console.log(response)
                data = response.url
            }
            const decodedMsg = await decodeOOBURL(data);
            const personLogo = require('../assets/smallBWPerson.png');
            if (data.toLowerCase().includes("_oob")){
                if ( decodedMsg.body.goal_code === "request-mediate"){
                    await setMediatorURL("https://mediator.rootsid.cloud")
                    await importContact({
                        displayName: 'Mediator',
                        displayPictureUrl: personLogo,
                        did: decodedMsg.from,
                        id: 'mediator'
                    })
                    clearAndGoBack()
                    navigation.navigate('Chat', { chatId: 'mediator' })
                    


                    // await requestMediate('mediator')
                }
                else if(decodedMsg.from.startsWith('did:web:')){
                    const avLogo = require('../assets/avierytech.png');
                    await importContact({
                        displayName: AVIERY_BOT,
                        displayPictureUrl: avLogo,
                        did: decodedMsg.from,
                        id: AVIERY_BOT
                    })
                    clearAndGoBack()
                    navigation.navigate('Chat', { chatId: AVIERY_BOT })
                }
                // ATALA PRISM AGENT OOB (Connect Protocol)
                else if(decodedMsg.body.goal_code === "connect"){
                    const atalaLogo = require('../assets/prismAgent.png');
                    await importContact({
                        displayName: "Prism Agent",
                        displayPictureUrl: atalaLogo,
                        did: decodedMsg.from,
                        id: "prism="+decodedMsg.id
                    })
                    clearAndGoBack()
                    navigation.navigate('Chat', { chatId: "prism="+decodedMsg.id })
                } 
                else if(decodedMsg.body.goal_code === "kyc-credential"){
                    const dataseersLogo = require('../assets/dataseers.png');
                    await importContact({
                        displayName: "KYC Issuer",
                        displayPictureUrl: dataseersLogo,
                        did: decodedMsg.from,
                        id: "kyc"+decodedMsg.id
                    })
                    clearAndGoBack()
                    navigation.navigate('Chat', { chatId: "kyc"+decodedMsg.id })
                }     
                

                else{

                console.log("Scan QR - OOB URL= " + data)
                //const jsonData = JSON.parse(decodedMsg)
                console.log('decodedMsg',decodedMsg)
                const personLogo = require('../assets/smallBWPerson.png');
                const displayName = decodedMsg.body.label !== undefined? decodedMsg.body.label : "Agent-"+uuid.v4().toString().slice(-5)
                await importContact({
                    displayName: displayName,
                    displayPictureUrl: personLogo,
                    did: decodedMsg.from,
                    id: uuid.v4().toString()
                })

                }
            }
        } else {
            // TODO HANDLE JSON ERROR
            const jsonData = JSON.parse(data)
            if (modelType == "credential") {
                console.log("Scan QR - Importing scanned vc",jsonData)
                await importVerifiedCredential(jsonData)
            } else if (modelType == "contact") {
                console.log("Scan QR - Importing scanned contact",jsonData)
                await importContact({
                    displayName: jsonData.from.slice(0,20),
                    displayPictureUrl: require('../assets/smallBWPerson.png'),
                    did: jsonData.from,
                    id: jsonData.id
                }) //jsonData
            }
        }
        clearAndGoBack()
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
