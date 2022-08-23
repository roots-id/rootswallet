import React, { useState } from 'react';
import {Button, View, Text, NativeModules, TextInput} from 'react-native';
import { createSideTreeDID, resolveSidetreeDID } from '../sidetree'

const Sidetree = () => {
    
    const [createdDID, setCreatedDID] = useState('')
    const [resolvedDID, setResolvedDID] = useState('')

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
            const did = await resolveSidetreeDID("did:ada:EiAaf8BXolZrMqSKZK_zTjfCKwFHO-WjLtW_avtXHtkJJg")
            setResolvedDID(JSON.stringify(did))
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View>
            <Text>SIDETREE-CARDANO</Text>
            <Button
                title='Create did:ada'
                color='#841584'
                onPress={createDid}
            />
            <Text>
                {createdDID}
            </Text>
            <Button
                title='Resolve did:ada'
                color='#841584'
                onPress={resolveDid}
            />
            <Text>
                {resolvedDID}
            </Text>
        
    </View>
    );
};

export default Sidetree