import React, { useState } from 'react';
import { Button, View, Text } from 'react-native';
import { demoCreatePublishDid } from '../prism/iohk'



const AtalaPrismDevScreen = (props) => {
    const [DID, setDID] = useState('')
    const [credential, setCredential] = useState('')

    async function atalaDid() {
        //TODO work on RPC RN->NodeJS issues
//        const did = await demoCreatePublishDid()
//        setDID(did)
        alert("Not implemented yet, comeback soon ;)")
    }

    return (
        <View>
            <Button
                title='Get Atala DID doc'
                color='#239B56'
                onPress={async () => {atalaDid()}}
            />
            <Text>{DID}</Text>
        </View>
    );
};

export default AtalaPrismDevScreen
