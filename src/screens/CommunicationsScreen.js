import React from 'react';
import {Button, View, Text, NativeModules} from 'react-native';
const { PeerDidModule, DIDCommV2Module } = NativeModules;

const Communications = (props) => {
    console.log(`Entering Communications screen`);
    const onPressHelloWorld = () => {
        // 1. Bob creates a pairwise peer DID for the connection
        var bobPeerDID = DIDCommV2Module.createPeerDID(1,1,null)
        console.log("Bob generates a new pairwise peer DID for communication with Alice: "+ bobPeerDID)
        console.log("")

        // 2. Alice creates a pairwise peer DID for the connection
        var alicePeerDID = DIDCommV2Module.createPeerDID(1,1,null)
        console.log("Alice generates a new pairwise peer DID for communication with Bob: "+ alicePeerDID)

        // 3. Alice sends message to Bob
        var msg = "Hello Bob!"
        var packedToBobMsg = DIDCommV2Module.pack(msg, from = alicePeerDID, to = bobPeerDID)
        console.log("Alice sends " +  msg + " to Bob.")
        console.log("The message is authenticated by Alice's peer DID " + alicePeerDID + " and encrypted to Bob's peer DID " + bobPeerDID)
        console.log("")

        // 4. Bob unpacks the message
        var unpackResultMsg = DIDCommV2Module.unpack(packedToBobMsg)
        console.log("Bob received " + unpackResultMsg + " from Alice.")

        
    };
    return (
        <View>
            <Text>Communications</Text>
            <Button
                title='Hello World'
                color='#841584'
                onPress={onPressHelloWorld}
            />
        </View>
    );
};

export default Communications
