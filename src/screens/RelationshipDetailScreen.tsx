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
    console.log("RelDetailScreen - route params are", JSON.stringify(route.params))
    const [rel, setRel] = useState<models.contact>(route.params.rel);
    const {current} = useCardAnimation();

    useEffect(() => {
        console.log("RelDetailScreen - rel changed", rel)
    }, [rel]);

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
                    backgroundColor: '#ffffff',
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
                            if (rel) {
                                console.log("RelDetailScreen - setting rel", rel)
                                setRel(await addDidDoc(rel))
                            } else {
                                console.error("RelDetailScreen - cant set rel, rel not set", rel)
                            }
                        }}
                    />
                    <IconButton
                        icon="qrcode"
                        size={36}
                        color="#e69138"
                        onPress={() => {
                            if (rel) {
                                console.log("RelDetailScreen - show QR for rel", rel)
                                showQR(navigation, asContactShareable(rel))
                            } else {
                                console.error("RelDetailScreen - cant show qr, rel not set", rel)
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
                <Image source={rel?.displayPictureUrl}
                       style={{
                           width: '30%',
                           height: '30%',
                           resizeMode: 'contain',
                           margin: 8,
                           justifyContent: 'flex-start',
                       }}
                />
                <Text style={styles.subText}>{rel?.displayName}</Text>
                <Divider/>
                <ScrollView style={styles.scrollableModal}>
                    <Text style={styles.subText}>{rel?.did}</Text>
                    <Divider/>
                    <Text style={styles.subText}>{recursivePrint(rel?.didDoc)}</Text>
                </ScrollView>
            </Animated.View>
        </View>
    );
}