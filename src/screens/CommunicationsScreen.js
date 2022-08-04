import React, { useState } from 'react';
import {Button, View, Text, NativeModules, TextInput} from 'react-native';
import { randomBytes } from 'react-native-randombytes'
import { X25519KeyPair } from '@transmute/did-key-x25519';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import uuid from 'react-native-uuid';
const { PeerDidModule, DIDCommV2Module } = NativeModules;


const Communications = (props) => {
    
    const [question, setQuestion] = useState(null)
    const [answer, setAnswer] = useState('')
    const [myPeerDID, setMyPeerDID] = useState('')
    const [mediatorDID, setMediatorDID] = useState('')
    const [agreemmentKey, setAgreementKey] = useState('')

    const generateKeyPair = async(type) => {
        let keyGenerator = Ed25519KeyPair;
        if (type == 'x25519') {keyGenerator = X25519KeyPair}
        const keyPair = await keyGenerator.generate({
          secureRandom: () => randomBytes(32)
        });
        const { publicKeyJwk, privateKeyJwk } = await keyPair.export({
            type: 'JsonWebKey2020',
            privateKey: true,
          });
        return {
          publicJwk: publicKeyJwk,
          privateJwk: privateKeyJwk
        };
      }

    const onPressHelloWorld = async() => {
        // 1. Bob creates a pairwise peer DID for the connection
        const bobAuthKey = await generateKeyPair('ed25519')
        const bobAgreemKey = await generateKeyPair('x25519')
        const bobPeerDID = PeerDidModule.createDID(bobAuthKey.publicJwk,bobAgreemKey.publicJwk,null,null)
        console.log("Bob generates a new pairwise peer DID for communication with Alice: "+ bobPeerDID)
        console.log("")

        // 2. Alice creates a pairwise peer DID for the connection
        const aliceAuthKey = await generateKeyPair('ed25519')
        const aliceAgreemKey = await generateKeyPair('x25519')
        const alicePeerDID = PeerDidModule.createDID(aliceAuthKey.publicJwk, aliceAgreemKey.publicJwk,null,null)
        console.log("Alice generates a new pairwise peer DID for communication with Bob: "+ alicePeerDID)

        // 3. Alice sends message to Bob
        var msg = {msg: "Hello Bob2!"}
        var packedToBobMsg = DIDCommV2Module.pack(
          msg, 
          id = uuid.v4(), 
          to = bobPeerDID, 
          from = alicePeerDID, 
          messageType = "my-protocol/1.0",
          customHeaders = [{return_route: "all"}],
          agreemKey = aliceAgreemKey, 
          signFrom = null, 
          protectSender = true ,
          attachments = null
        )
        console.log("Alice sends " +  msg + " to Bob.")
        console.log("The message is authenticated by Alice's peer DID " + alicePeerDID + " and encrypted to Bob's peer DID " )
        console.log("")

        // 4. Bob unpacks the message
        var unpackResultMsg = DIDCommV2Module.unpack(packedToBobMsg, to = bobPeerDID, agreemKey = bobAgreemKey)
        console.log("Bob received " + JSON.parse(unpackResultMsg).body.msg + " from Alice.")
        
    };

    const getMediator = async() => {
      // Create a DID Peer to connect to the mediator (for use later)
      const myAuthKey = await generateKeyPair('ed25519')
      const myAgreemKey = await generateKeyPair('x25519')
      setAgreementKey(myAgreemKey)
      setMyPeerDID(PeerDidModule.createDID(myAuthKey.publicJwk,myAgreemKey.publicJwk,"https://www.example.com/bob",null))
     
      // GET Mediator OOB URL and decode DID
      try {
        const response = await fetch(
          'https://mediator.rootsid.cloud/oob_url'
        );
        
        const oob_url = await response.text();
        console.log(oob_url)
        console.log("\n")
        const encodedMsg = oob_url.split("=")[1]
        const decodedMsg = JSON.parse(Buffer.from(encodedMsg, 'base64').toString('ascii'))
        setMediatorDID(decodedMsg.from)

      } catch (error) {
        console.error(error);
      }


    }

    const onPingMediator = async() => {
        try{
            const pingBody = { response_requested: true }
            const pingMsgPacked = DIDCommV2Module.pack(
            pingBody,
            id = uuid.v4(),
            to = mediatorDID, 
            from = myPeerDID, 
            messageType = "https://didcomm.org/trust-ping/2.0/ping",
            customHeaders = [{return_route: "all"}],
            agreemKey = agreemmentKey, 
            signFrom = null, 
            protectSender = true,
            attachments = null
            )
            const resp2 = await fetch('https://mediator.rootsid.cloud/', {
                method: 'POST',
                headers: {'Content-Type': 'application/didcomm-encrypted+json'},
                body: pingMsgPacked
            });
            const resp2Packed = await resp2.json();
            const resp2Unpacked = DIDCommV2Module.unpack(resp2Packed, to = myPeerDID, agreemKey = agreemmentKey)
            console.log(JSON.parse(resp2Unpacked))
          
  
        } catch (error) {
            console.error(error);
        }
  
  
      }


      const askMediator = async() => {
        try{
            const msgBody = { content: question }
            console.log(question)
            const askMsgPacked = DIDCommV2Module.pack(
                msgBody,
            id = uuid.v4(),
            to = mediatorDID, 
            from = myPeerDID, 
            messageType = "https://didcomm.org/basicmessage/2.0/message",
            customHeaders = [{return_route: "all"}, {created_time: Math.floor(new Date().getTime()/1000)}],
            agreemKey = agreemmentKey, 
            signFrom = null, 
            protectSender = true,
            attachments = null
            )
            const resp2 = await fetch('https://mediator.rootsid.cloud/', {
                method: 'POST',
                headers: {'Content-Type': 'application/didcomm-encrypted+json'},
                body: askMsgPacked
            });
            const resp2Packed = await resp2.json();
            const resp2Unpacked = DIDCommV2Module.unpack(resp2Packed, to = myPeerDID, agreemKey = agreemmentKey)
            
            const answer = JSON.parse(resp2Unpacked)
            console.log(answer.body.content)
            setAnswer(answer.body.content)
          
  
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