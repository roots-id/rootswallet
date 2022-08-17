import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {IconButton, Title} from 'react-native-paper';
import * as models from '../models'
import {generateIdFromName} from '../relationships';
import {initRoot} from '../roots';
import {displayOrHide, styles} from '../styles/styles'
import {CompositeScreenProps, DefaultNavigatorOptions} from "@react-navigation/core/src/types";

export default function CreateRelScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [rel, setRel] = useState<models.contact>(route.params.rel);
    const [relName, setRelName] = useState<string>(rel.displayName);
    const [relAvatar, setRelAvatar] = useState<string>(rel.displayPictureUrl);
    const [relDid, setRelDid] = useState<string>(rel.did);
    const [problemDisabled, setProblemDisabled] = useState<boolean>(true)
    const [errorText, setErrorText] = useState(<View/>)

    async function handleButtonPress() {
        if (relName.length > 0) {
            const root = await initRoot(relName, generateIdFromName(relName), relDid, relName, relAvatar)
            if (root) {
                console.log("Created rel", root)
                setProblemDisabled(true)
                navigation.navigate('Relationships')
            } else {
                console.log("Could not create relationship")
                setProblemDisabled(false)
            }
        }
    }

    useEffect(() => {
        if (!problemDisabled) {
            setErrorText(<View><Text style={displayOrHide(problemDisabled)}>Could not create
                relationship</Text></View>)
        } else {
            setErrorText(<View></View>)
        }
    }, [problemDisabled])

    return (
        <View style={styles.container}>
            <View style={styles.closeButtonContainer}>
                <IconButton
                    icon="close-circle"
                    size={36}
                    color="#e69138"
                    onPress={() => navigation.goBack()}
                />
            </View>
            <View style={styles.innerContainer}>
                <Title style={styles.titleText}>Create a new relationship</Title>
                <FormInput
                    labelName="Relationship Name"
                    value={relName}
                    onChangeText={(text: string) => setRelName(text)}
                    clearButtonMode="while-editing"
                />
                <FormInput
                    labelName="Avatar"
                    value={relAvatar}
                    onChangeText={(text: string) => setRelAvatar(text)}
                    clearButtonMode="while-editing"
                />
                <FormInput
                    labelName="Decentralized ID"
                    value={relDid}
                    onChangeText={(text: string) => setRelDid(text)}
                    clearButtonMode="while-editing"
                />
                {errorText}
                <FormButton
                    title="Create Relationship"
                    modeValue="contained"
                    labelStyle={styles.buttonText}
                    onPress={async () => handleButtonPress()}
                    disabled={relName.length <= 0 || relDid.length <= 0}
                />
            </View>
        </View>
    );
}
