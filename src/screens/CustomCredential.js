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


export default function CustomCredential({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("cred details - route params are", JSON.stringify(route.params.credential))
    const [cred, setCred] = useState(route.params.credential)
    const [showJson, setShowJson] = useState(false)

    const [verified, setVerified] = useState("help-circle");
    const {colors} = useTheme();
    const {current} = useCardAnimation();

    useEffect(() => {
        console.log("cred details - initially setting cred", cred)
        // setCred(route.params.cred)
    }, []);


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
                        onPress={() => setShowJson(!showJson)}
                    />
                    <IconButton
                        icon="qrcode"
                        size={36}
                        color="#e69138"
                        // onPress={() => showQR(navigation, cred.verifiedCredential)}
                    />
                </View>

                <Image source={{uri: cred.credentialSubject.achievement.image}}
                       style={styles.credLogoStyle}
                />
                <Text style={styles.credTitleStyle}>{cred.issuer.name}</Text>
                <Text style={styles.credTitleStyle}>{cred.credentialSubject.achievement.type}</Text>
                <Text style={styles.credTitleStyle}>{cred.credentialSubject.achievement.name}</Text>
                <Text style={styles.credTitleStyle}>{cred.credentialSubject.achievement.description}</Text>
                <Divider style={styles.dividerStyle}/>
                <Text style={styles.credTitleStyle}>{cred.credentialSubject.achievement.criteria.type}</Text>
                <Text style={styles.credTitleStyle}>{cred.credentialSubject.achievement.criteria.narrative}</Text>


                {/* //show scrollView only if the state 'detail' is set to true */}
                {showJson && (
                    <ScrollView style={styles.scrollView}>
                    <Text style={styles.credText}>{JSON.stringify(cred, null, 2)}</Text>
                </ScrollView>
                )}
                
           

                {/* <FlatList
                    data={Object.keys(cred.credentialSubject)}
                    keyExtractor={(item) => item}
                    ItemSeparatorComponent={() => <Divider/>}
                    renderItem={({item}) => {
                        const output = utils.recursivePrint(getCredPart(item))
                        console.log(item, ": ", output)
                        return <ScrollView style={styles.scrollableModal}><Text
                            style={{color: "black"}}>{item + ": " + output}</Text></ScrollView>
                    }}
                /> */}
            </Animated.View>
        </View>
    );
}
