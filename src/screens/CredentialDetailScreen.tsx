import React, {useEffect, useState} from 'react';
import {
    Animated,
    FlatList,
    Image,
    Text,
    Pressable,
    View, ScrollView,
} from 'react-native';
import {Divider, IconButton} from 'react-native-paper';
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
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import {ImageProps} from "react-native-svg/lib/typescript/ReactNativeSVG";


export default function CredentialDetailScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("cred details - route params are", JSON.stringify(route.params))
    const [cred, setCred] = useState<models.credential>(route.params.cred);
    const [verified, setVerified] = useState("help-circle");
    const {colors} = useTheme();
    const {current} = useCardAnimation();

    useEffect(() => {
        console.log("cred details - initially setting cred", cred)
        setCred(route.params.cred)
    }, []);

    function getCredPart(field: string) {
        const c = decodeCredential(cred.verifiedCredential.encodedSignedCredential)
        const cObj = c.credentialSubject
        return utils.getObjectField(cObj, field)
    }

    async function updateVerification() {
        const wal = wallet.getWallet()
        if (wal) {
            const verify = await verifyCredentialByHash(cred.verifiedCredential.proof.hash, wal)
            if (verify) {
                const result = JSON.parse(verify);
                logger("cred details - verify cred result", result)
                if (result && result.length <= 0) {
                    setVerified("check-bold")
                } else if (result && result.length > 0) {
                    setVerified("close-octagon-outline")
                } else {
                    setVerified("help-circle")
                }
            } else {
                console.error("CredDeetsScreen - could not verify", verify)
                setVerified("alert-octagon")
            }
        } else {
            console.error("CredDeetsScreen - could not get wallet", wallet.getWalletName(), wal)
            setVerified("alert-octagon")
        }
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
                </View>
                <Image source={{uri: "https://raw.githubusercontent.com/roots-id/rootswallet/main/assets/icon.png"}}
                       style={styles.credLogoStyle}
                />
                <FlatList
                    data={Object.keys(decodeCredential(cred.verifiedCredential.encodedSignedCredential).credentialSubject)}
                    keyExtractor={(item) => item}
                    ItemSeparatorComponent={() => <Divider/>}
                    renderItem={({item}) => {
                        const output = utils.recursivePrint(getCredPart(item))
                        console.log(item, ": ", output)
                        return <ScrollView style={styles.scrollableModal}><Text
                            style={{color: "black"}}>{item + ": " + output}</Text></ScrollView>
                    }}
                />
            </Animated.View>
        </View>
    );
}
