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
import { getDemoRel, getUserId, AVIERY_BOT} from '../relationships';
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
        console.log("QR DATA", data)

        //check if data is an integer
      

        if (data.startsWith("http") || data.startsWith("ws") || Number.isInteger(parseInt(data)) ){
            console.log(data)
            if( Number.isInteger(parseInt(data))){
                const decodedMsg = await decodeOOBURL(`
                https://www.domain.com/path?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiNjM0OTNhNWYtYjZlNS00NTM5LWE1MDQtNjg4ODlmZTBmZjQ4IiwiZnJvbSI6ImRpZDpwZWVyOjIuRXo2TFNlazFTTnRNZVBzczNOZ3FBN3lrQVZGUURDWmNIQkpTNnlUZHhWUGk0cVB3Qy5WejZNa2ZxdUtxcG5qNFB0ZXBVS29GcDVnVUNReGd3cEQ2b0JMcjdlVXVyMnh3eG5zLlNleUp5SWpwYlhTd2ljeUk2SW1ScFpEcHdaV1Z5T2pJdVJYbzJURk50Y3pVMU5WbG9SblJvYmpGWFZqaGphVVJDY0ZwdE9EWm9TemwwY0RnelYyOXFTbFZ0ZUZCSGF6Rm9XaTVXZWpaTmEyMWtRbXBOZVVJMFZGTTFWV0ppVVhjMU5ITjZiVGg1ZGsxTlpqRm1kRWRXTW5OUlZsbEJlR0ZsVjJoRkxsTmxlVXB3V2tOSk5rbHROV3hrZVRGd1drTkpjMGx1VVdsUGFVcHJZbE5KYzBsdVRXbFBhVXB2WkVoU2QyTjZiM1pNTWpGc1drZHNhR1JIT1hsTWJrcDJZak5TZW1GWFVYVlpNbmgyWkZkUmFVeERTbWhKYW5CaVNXMVNjRnBIVG5aaVZ6QjJaR3BKYVZoWU1DSXNJbUVpT2x0ZExDSjBJam9pWkcwaWZRIiwiYm9keSI6eyJhY2NlcHQiOlsiZGlkY29tbS92MiJdLCJsYWJlbCI6IlByaXNtIERlbW8ifX0=
                
                `.trim());
                const personLogo = require('../assets/smallBWPerson.png');

                await importContact({
                    displayName:  decodedMsg.body.label,
                    displayPictureUrl: personLogo,
                    did: decodedMsg.from,
                    id: decodedMsg.body.label
                })
                clearAndGoBack()
                navigation.navigate('Chat', { chatId:  decodedMsg.body.label })
                
            }
            if (data.toLowerCase().includes("_oobid")){
                const response = await fetch(data);
                data = response.url
            }
            const decodedMsg = await decodeOOBURL(data);
            const personLogo = require('../assets/smallBWPerson.png');
            if (data.toLowerCase().includes("_oob")){
                if (data.toLowerCase().startsWith("https://mediator.rootsid.cloud") && decodedMsg.body.goal === "RequestMediate"){
                    setMediatorURL("https://mediator.rootsid.cloud")
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
                    
                

                else{

                console.log("Scan QR - OOB URL= " + data)
                //const jsonData = JSON.parse(decodedMsg)
                console.log('decodedMsg',decodedMsg)
                const personLogo = require('../assets/smallBWPerson.png');
                const displayName = decodedMsg.body.label !== undefined? decodedMsg.body.label : "Agent-"+uuid.v4().toString().slice(-5)
                await importContact({
                    displayName: displayName,
                    displayPictureUrl: personLogo,
                    did: decodedMsg.body.from,
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
                await importContact(jsonData)
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
