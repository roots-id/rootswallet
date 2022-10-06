import React, {useEffect, useState} from 'react';
import {
    Animated,
    Text,
    Pressable,
    ScrollView,
    View, Button,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useCardAnimation} from '@react-navigation/stack';
import {IconButton, ToggleButton} from 'react-native-paper';
import {styles} from "../styles/styles";
import * as models from '../models'

import * as roots from '../roots'
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import FormButton from "../components/FormButton";
import { getContactByAlias} from '../relationships'


import {Bubble, GiftedChat, IMessage, InputToolbar, InputToolbarProps, Reply, User} from 'react-native-gifted-chat';

export default function MediatorLogsScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [messages, setMessages] = useState<models.message[]>(roots.getMessagesByChat('mediator'));

    const {current} = useCardAnimation();
    useEffect(() => {
        const interval = setInterval(async () => {
            setMessages(roots.getMessagesByChat('mediator'))
            
        }, 500);
        return () => clearInterval(interval);
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
                style={styles.viewAnimatedStart}
            >
                
                <Text style={[styles.titleText,styles.black]}>Mediator Logs:</Text>
                <ScrollView style={{padding: 16,
        width: '95%',
        maxWidth: 350,
        maxHeight: 550,
        borderRadius: 3,
        backgroundColor: '#cfbfca',
        }}>
                {
                    messages.map((msg) => {
                        return ( 
                            //row text for each message
                            <View style={styles.row}>
                                <Text >{msg.body}</Text>
                            </View>
                        )
                    })
                }
                </ScrollView>
            </Animated.View>
        </View>
    );
}
