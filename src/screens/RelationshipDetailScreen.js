import React, {useEffect, useState} from 'react';
import {
    Animated,
    Button,
    FlatList,
    Image,
    Text,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useCardAnimation} from '@react-navigation/stack';

import {logger} from '../logging';
import {Divider, IconButton, List, Title, ToggleButton} from 'react-native-paper';
import styles from "../styles/styles";

import * as models from '../models'
import {showQR} from '../qrcode'
import {
    addDidDoc,
    asContactShareable,
    getContactByAlias,
    getContactByDid,
    getShareableRelByAlias,
    isShareable
} from '../relationships'
import {recursivePrint} from '../utils'

export default function RelationshipDetailScreen({route, navigation}) {
    console.log("route params are", JSON.stringify(route.params))
    const [shareableRel, setShareableRel] = useState({});
    const {colors} = useTheme();
    const {current} = useCardAnimation();

    useEffect(() => {
        const contact = (route.params.rel)
        if (!isShareable(contact)) {
            setShareableRel(asContactShareable(getContactByAlias(contact.id)))
        } else {
            setShareableRel(asContactShareable(getContactByDid(contact.did)))
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
                        onPress={async () => setShareableRel(await addDidDoc(shareableRel))}
                    />
                    <IconButton
                        icon="qrcode"
                        size={36}
                        color="#e69138"
                        onPress={() => showQR(navigation, shareableRel)}
                    />
                    <IconButton
                        icon="close-circle"
                        size={36}
                        color="#e69138"
                        onPress={() => navigation.goBack()}
                    />
                </View>
                <Image source={shareableRel.displayPictureUrl}
                       style={{
                           width: '30%',
                           height: '30%',
                           resizeMode: 'contain',
                           margin: 8,
                           justifyContent: 'flex-start',
                       }}
                />
                <Text style={styles.subText}>{shareableRel.displayName}</Text>
                <Divider/>
                <ScrollView style={{
                        padding: 16,
                        width: '90%',
                        maxWidth: 450,
                        maxHeight: 250,
                        borderRadius: 3,
                        backgroundColor: colors.card,}}>
                    <Text style={styles.subText}>{shareableRel.did}</Text>
                    <Divider/>
                    <Text style={styles.subText}>{recursivePrint(shareableRel.didDoc)}</Text>
                </ScrollView>
            </Animated.View>
        </View>
    );
}

// <SafeAreaView style={styles.container}>
//     <FlatList
//         data={keys}
//         keyExtractor={(item) => item}
//         ItemSeparatorComponent={() => <Divider />}
//         renderItem={({ item }) =>
//         {
//             const output = recursivePrint(wallet[item])
//             console.log(item,": ",output)
//             return <Text style={styles.listItem}>{item + ": " + output}</Text>
//         }
//         }
//     />
// </SafeAreaView>