import React, {useState} from 'react';
import {NativeModules, StyleSheet, Text, View} from 'react-native';
import {IconButton, Title} from 'react-native-paper';
import * as rel from '../relationships'
import {createChat, getDid} from '../roots';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';

export default function CreateChatScreen({navigation}) {
    const [chatName, setChatName] = useState('');
    const [theirDid, setTheirDid] = useState();
    const [problemDisabled, setProblemDisabled] = useState(true)

    async function handleButtonPress() {
        if (chatName?.length > 0 && theirDid?.length > 0) {
            const chat = await createChat(chatName, getDid(rel.YOU_ALIAS), theirDid)
            if (chat) {
                console.log("Created chat", chat)
                setProblemDisabled(true)
                navigation.navigate('Chats')
            } else {
                console.log("Could not create chat")
                setProblemDisabled(false)
            }
        }
    }

    return (
        <View style={styles.rootContainer}>
            <View style={styles.closeButtonContainer}>
                <IconButton
                    icon="close-circle"
                    size={36}
                    color="#e69138"
                    onPress={() => navigation.goBack()}
                />
            </View>
            <View style={styles.innerContainer}>
                <Title style={styles.title}>Create a new chat</Title>
                <FormInput
                    labelName="Enter Chat Name"
                    value={chatName}
                    onChangeText={(text) => setChatName(text)}
                    clearButtonMode="while-editing"
                />
                <Text disable={problemDisabled} style={displayProblem(problemDisabled)}>Could not create chat</Text>
                <FormButton
                    title="Create"
                    modeValue="contained"
                    labelStyle={styles.buttonLabel}
                    onPress={async () => handleButtonPress()}
                    disabled={chatName.length <= 0}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: '#222222',
    },
    buttonLabel: {
        fontSize: 22,
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 30,
        right: 0,
        zIndex: 1,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    none: {
        display: 'none'
    },
    problem: {
        color: 'red',
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        color: '#dddddd',
    },
});

function displayProblem(problemDisabled) {
    if (problemDisabled) {
        return styles.none
    } else {
        return styles.problem
    }
}
