import React, { useState } from 'react';
import { Button, View, Text } from 'react-native';
import { demoCreatePublishDid } from '../prism/iohk'



const AtalaPrismDevScreen = (props) => {
    const [DID, setDID] = useState('')
    const [credential, setCredential] = useState('')


    return (
        <View>
            <Button
                title='Create Atala DID'
                color='#239B56'
                onPress={() => {setDID(demoCreatePublishDid())}}
            />
            <Text>{DID}</Text>
        </View>
    );
};

export default AtalaPrismDevScreen
