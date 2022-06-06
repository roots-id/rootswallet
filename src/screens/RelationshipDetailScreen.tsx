import React, {useEffect, useState} from 'react';
import {
    Animated,
    Image,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useCardAnimation} from '@react-navigation/stack';
import {Divider, IconButton } from 'react-native-paper';
import {styles} from "../styles/styles";

import * as models from '../models'
import {showQR} from '../qrcode'
import {
    addDidDoc,
    asContactShareable,
    isShareable
} from '../relationships'
import {recursivePrint} from '../utils'

export default function RelationshipDetailScreen({route, navigation}) {
    console.log("route params are", JSON.stringify(route.params))
    const [shareableRel, setShareableRel] = useState<models.contactShareable>();
    const {colors} = useTheme();
    const {current} = useCardAnimation();

    useEffect(() => {
        const contact = (route.params.rel)
        if (!isShareable(contact)) {
            setShareableRel(asContactShareable(contact))
        } else {
            setShareableRel(asContactShareable(contact))
        }
    }, []);

    useEffect(() => {
        console.log("rel changed", shareableRel)
    }, [shareableRel]);

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
                        icon="text-box"
                        size={36}
                        color="#e69138"
                        onPress={async () => {
                            if (shareableRel) {
                                console.log("RelDetailScreen - setting shareableRel", shareableRel)
                                setShareableRel(await addDidDoc(shareableRel))
                            } else {
                                console.error("RelDetailScreen - cant set shareableRel, shareableRel not set", shareableRel)
                            }
                        }}
                    />
                    <IconButton
                        icon="qrcode"
                        size={36}
                        color="#e69138"
                        onPress={() => {
                            if (shareableRel) {
                                console.log("RelDetailScreen - show QR for shareableRel", shareableRel)
                                showQR(navigation, JSON.stringify(shareableRel))
                            } else {
                                console.error("RelDetailScreen - cant show qr, shareableRel not set", shareableRel)
                            }
                        }}
                    />
                    <IconButton
                        icon="close-circle"
                        size={36}
                        color="#e69138"
                        onPress={() => navigation.goBack()}
                    />
                </View>
                <Image source={shareableRel?.displayPictureUrl}
                       style={{
                           width: '30%',
                           height: '30%',
                           resizeMode: 'contain',
                           margin: 8,
                           justifyContent: 'flex-start',
                       }}
                />
                <Text style={styles.subText}>{shareableRel?.displayName}</Text>
                <Divider/>
                <ScrollView style={{
                    padding: 16,
                    width: '90%',
                    maxWidth: 450,
                    maxHeight: 250,
                    borderRadius: 3,
                    backgroundColor: colors.card,
                }}>
                    <Text style={styles.subText}>{shareableRel?.did}</Text>
                    <Divider/>
                    <Text style={styles.subText}>{recursivePrint(shareableRel?.didDoc)}</Text>
                </ScrollView>
            </Animated.View>
        </View>
    );
}