import React, { useState } from 'react';
import {Button, View, Text, NativeModules, TextInput} from 'react-native';
import { createDIDPeer} from '../didpeer'
import { decodeOOBURL, sendPing, sendBasicMessage } from '../protocols';
import { pack, unpack } from '../didcommv2' 

const Communications = (props) => {
    const [question, setQuestion] = useState(null)
    const [answer, setAnswer] = useState('')
    const [myPeerDID, setMyPeerDID] = useState('')
    const [mediatorDID, setMediatorDID] = useState('')

    const onPressHelloWorld = async() => {
        // TODO This Hello World should be moved to tests
        // 1. Bob creates a pairwise peer DID for the connection
        const bobPeerDID = await createDIDPeer(null, null)
        console.log("Bob generates a new pairwise peer DID for communication with Alice: "+ bobPeerDID)
        console.log("")

        // 2. Alice creates a pairwise peer DID for the connection
        const alicePeerDID = await createDIDPeer(null, null)
        console.log("Alice generates a new pairwise peer DID for communication with Bob: "+ alicePeerDID)

        // 3. Alice sends message to Bob
        var msg = {msg: "Hello Bob!"}
        const packedToBobMsg = await pack(
          msg, 
          alicePeerDID, 
          bobPeerDID, 
          "my-protocol/1.0", 
          [{return_route: "all"}],
          null,
          true,
          null
          )
        console.log("Alice sends " +  msg + " to Bob.")
        console.log("The message is authenticated by Alice's peer DID " + alicePeerDID + " and encrypted to Bob's peer DID " )
        console.log("")

        // 4. Bob unpacks the message
        var unpackResultMsg = await unpack(packedToBobMsg)
        console.log(unpackResultMsg)
        console.log("Bob received " + JSON.parse(unpackResultMsg.message).body.msg + " from Alice.")
    }

    const getMediator = async() => {
      // Create a DID Peer to connect to the mediator (for use later)
      setMyPeerDID(await createDIDPeer("https://www.example.com/bob",null))
     
      // GET Mediator OOB URL and decode DID
      try {
        const response = await fetch(
          'https://mediator.rootsid.cloud/oob_url'
        );
        const oob_url = await response.text()
        const decodedMsg = await decodeOOBURL(oob_url)
        setMediatorDID(decodedMsg.from)

      } catch (error) {
        console.error(error);
      }
    }

    const onPingMediator = async() => {
        try{
            const resp = await sendPing(myPeerDID, mediatorDID)
            console.log(resp)
        } catch (error) {
            console.error(error);
        }
      }

      const askMediator = async() => {
        try{
            const answer = await sendBasicMessage(question, myPeerDID, mediatorDID)
            setAnswer(answer)          
        } catch (error) {
            console.error(error);
        }
      }

    return (
        <View>
            <Text>DIDComm v2</Text>
            <Button
                title='Hello World'
                color='#841584'
                onPress={onPressHelloWorld}
            />
        <Text>Mediator</Text>
        <Button
            title='Read QR code'
            color='#841584'
            onPress={getMediator}
        />
        <Text>
            {mediatorDID}
        </Text>
        <Button
            title='Ping mediator'
            color='#841584'
            onPress={onPingMediator}
        />
        <TextInput
            placeholder="Ask a question"  
            value = {question}
            onChangeText = {setQuestion}
        />
        <Button
            title='Ask'
            color='#841584'
            onPress={askMediator}
        />
        <Text>
            {answer}
        </Text>
    </View>
    );
};

export default Communications