import React, { useState } from 'react';
import {Button, View, Text, NativeModules, TextInput} from 'react-native';
import { createSideTreeDID, resolveSidetreeDID } from '../sidetree'

const Sidetree = () => {
    
    const [createdDID, setCreatedDID] = useState('')
    const [resolvedDID, setResolvedDID] = useState('')
    const [didToResolve, setDidToResolve] = useState('')

    const createDid = async () => {
        try {
            const did = await createSideTreeDID("", [""])
            setCreatedDID(did)
        } catch (error) {
            console.error(error);
        }
    }

    const resolveDid = async () => {
        try {
            const didDoc = await resolveSidetreeDID(didToResolve)
            setResolvedDID(JSON.stringify(didDoc))
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View>
            <Button
                title='Create did:ada'
                color='#b65100'
                onPress={createDid}
            />
            <Text>
                {createdDID}
            </Text>
            <Button
                title='Resolve did:ada'
                color='#b65100'
                onPress={resolveDid}
            />
            <TextInput
                placeholder="did:ada:"
                value={didToResolve}
                onChangeText={setDidToResolve}
            />
            <Text>
                {resolvedDID}
            </Text>
        
    </View>
    );
};

export default Sidetree