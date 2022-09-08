import React, { useState } from 'react';
import { Button, View, Text } from 'react-native';
import { demoCreatePublishDid } from '../prism/iohk'



const AtalaPrismDevScreen = (props) => {
    const [DID, setDID] = useState('')
    const [credential, setCredential] = useState('')

    async function atalaDid() {
        const did = await demoCreatePublishDid()
        setDID(did)
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
