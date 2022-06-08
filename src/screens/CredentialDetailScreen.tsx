import React, {useEffect, useState} from 'react';
import {
    Animated,
    Button,
    FlatList,
    Image,
    Text,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View, ScrollView,
} from 'react-native';
import {Divider, IconButton, List, Title, ToggleButton} from 'react-native-paper';
import {useTheme} from '@react-navigation/native';
import {useCardAnimation} from '@react-navigation/stack';

import {credLogo, decodeCredential, verifyCredentialByHash} from '../credentials'
import {logger} from '../logging';
import * as models from '../models';
import {showQR} from '../qrcode'
import * as roots from '../roots'
import {styles} from "../styles/styles";
import * as utils from '../utils'
import * as wallet from '../wallet'


export default function CredentialDetailScreen({route, navigation}) {
    console.log("cred details - route params are", JSON.stringify(route.params))
    const [cred, setCred] = useState<models.credential>(route.params.cred);
    const [verified, setVerified] = useState("help-circle");
    const {colors} = useTheme();
    const {current} = useCardAnimation();

    useEffect(() => {
        console.log("cred details - initially setting cred", cred)
        setCred(route.params.cred)
    }, []);

    async function updateVerification() {
        const wal = wallet.getWallet(roots.TEST_WALLET_NAME)
        if (wal) {
            const verify = await verifyCredentialByHash(cred.verifiedCredential.proof.hash, wal)
            if (verify) {
                const result = JSON.parse(verify);
                logger("cred details - verify cred result", result)
                if (result && result.length <= 0) {
                    setVerified("check-bold")
                } else if (result && result.length > 0) {
                    setVerified("alert-octagon")
                } else {
                    setVerified("help-circle")
                }
            }
        } else {
            console.error("CredDeetsScreen - could not get wallet", roots.TEST_WALLET_NAME, wal)
        }
    }

//        <RelRow rel={getShareableRelByAlias(cred.decoded.id)} nav={navigation}/>
//        <Text style={styles.subText}>Last Verified: "Not verified"</Text>
//          <Text style={styles.subText}>From: </Text>
//          <Text style={styles.subText}>To: {cred.decoded.credentialSubject.id}</Text>
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
                    maxWidth: 500,
                    borderRadius: 3,
                    backgroundColor: colors.card,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
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
                <View style={{flexDirection: 'row',}}>
                    <IconButton
                        icon={verified}
                        size={36}
                        color="#e69138"
                        onPress={async () => updateVerification()}
                    />
                    <IconButton
                        icon="qrcode"
                        size={36}
                        color="#e69138"
                        onPress={() => showQR(navigation, cred.verifiedCredential)}
                    />
                    <IconButton
                        icon="close-circle"
                        size={36}
                        color="#e69138"
                        onPress={() => navigation.goBack()}
                    />
                </View>
                <Image source={credLogo}
                       style={styles.credLogoStyle}
                />
                <FlatList
                    data={Object.keys(decodeCredential(cred.verifiedCredential.encodedSignedCredential).credentialSubject)}
                    keyExtractor={(item) => item}
                    ItemSeparatorComponent={() => <Divider/>}
                    renderItem={({item}) => {
                        const output = utils.recursivePrint(decodeCredential(cred.verifiedCredential.encodedSignedCredential).credentialSubject[item])
                        console.log(item, ": ", output)
                        return <ScrollView style={styles.scrollableModal}><Text style={{color: "black"}}>{item + ": " + output}</Text></ScrollView>
                    }}
                />
            </Animated.View>
        </View>
    );
}