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
    const {DIDCommModule} = NativeModules;

    const onPressHelloWorld = async() => {
        // TODO This Hello World should be moved to tests
        // 1. Bob creates a pairwise peer DID for the connection
        const bobPeerDID = await createDIDPeer(null, null)
        console.log("Bob generates a new pairwise peer DID for communication with Alice: "+ bobPeerDID)
        console.log("")

        // 2. Alice creates a pairwise peer DID for the connection
        //const alicePeerDID = await createDIDPeer(null, null)
        const alicePeerDID = bobPeerDID
        console.log("Alice generates a new pairwise peer DID for communication with Bob: "+ alicePeerDID)

        // 3. Alice sends message to Bob
        var msg = {msg: "Hello Bob!"}
        const packedToBobMsg = await pack(
          msg, 
          alicePeerDID, 
          bobPeerDID, 
          "my-protocol/1.0", 
          [],
          null,
          false,
          null,
          )
        console.log("Alice sends " +  msg + " to Bob.")
        console.log("The message is authenticated by Alice's peer DID " + alicePeerDID + " and encrypted to Bob's peer DID " )
        console.log(packedToBobMsg)
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
    const testDIDCommX = async() => {
                
        const peerdid = await createDIDPeer("https://www.example.com/bob",[])
        console.log("CREATING DID PEER 2")
        console.log(peerdid)
        const privateKey = {
            kty: "OKP",
            crv: "X25519",
            kid: "did:peer:bob#key-1",
            x: "avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs",
            d: "r-jK2cO3taR8LQnJB1_ikLBTAnOtShJOsHXRUWT-aZA"
        }
        const packMsg2 = await DIDCommModule.pack(
            JSON.stringify({"content": "Hola Bob!"}),
            "ABCD-12345-67890",
            null,
            "did:peer:bob",
            "did:peer:bob",
            "my-protocol/1.0",
            {},
            JSON.stringify(privateKey),
            false,
            false,
            []
        )
        console.log("PACK MSG")
        console.log(JSON.stringify(packMsg2))

        const unpackResultMsg = await DIDCommModule.unpack(packMsg2[0],JSON.stringify(privateKey)) 
        console.log("UNPACK MSG")
        console.log(unpackResultMsg[0].body)
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
        <Button
            title="DIDCommX"
            color="#841584"
            onPress={testDIDCommX}
        />
        <Text>
            {answer}
        </Text>
    </View>
    );
};

export default Communications