import React, {useEffect, useState} from 'react';
import {
    Animated,
    Image,
    Text,
    Pressable,
    ScrollView,
    View,
} from 'react-native';
import {Divider, IconButton} from 'react-native-paper';
import {styles} from "../styles/styles";

import * as models from '../models'
import {showQR} from '../qrcode'
import {
    addDidDoc,
    asContactShareable,
} from '../relationships'
import {recursivePrint} from '../utils'
import {CompositeScreenProps} from "@react-navigation/core/src/types";

export default function RelationshipDetailScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("RelDetailScreen - route params are", JSON.stringify(route.params))
    const [rel, setRel] = useState<models.contact>(route.params.rel);

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
                </View>
                <Image source={rel.displayPictureUrl}
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
