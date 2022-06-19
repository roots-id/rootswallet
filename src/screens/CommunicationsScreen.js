import React from 'react';
import {Button, View, Text, NativeModules} from 'react-native';
import { randomBytes } from 'react-native-randombytes'
import { X25519KeyPair } from '@transmute/did-key-x25519';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import uuid from 'react-native-uuid';
const { PeerDidModule, DIDCommV2Module } = NativeModules;


const Communications = (props) => {
    console.log(`Entering Communications screen`);

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
        var msg = {msg: "Hello Bob!"}
        var packedToBobMsg = DIDCommV2Module.pack(
          msg, 
          id = uuid.v4(), 
          to = bobPeerDID, 
          from = alicePeerDID, 
          messageType = "my-protocol/1.0",
          // customHeaders = [{return_route: "all"}],
          agreemKey = aliceAgreemKey, 
          signFrom = null, 
          protectSender = true 
        )
        console.log("Alice sends " +  msg + " to Bob.")
        console.log("The message is authenticated by Alice's peer DID " + alicePeerDID + " and encrypted to Bob's peer DID " )
        console.log("")

        // 4. Bob unpacks the message
        var unpackResultMsg = DIDCommV2Module.unpack(packedToBobMsg, to = bobPeerDID, agreemKey = bobAgreemKey)
        console.log("Bob received " + unpackResultMsg + " from Alice.")
        
    };

    const onPingMediator = async() => {
      const myAuthKey = await generateKeyPair('ed25519')
      const myAgreemKey = await generateKeyPair('x25519')
      const myPeerDID = PeerDidModule.createDID(myAuthKey.publicJwk,myAgreemKey.publicJwk,"https://www.example.com/bob",null)
      console.log("Peer DID: "+ myPeerDID)
      console.log("\n")
      // GET Mediator OOB URL
      try {
        const response = await fetch(
          'http://localhost:8000/oob_url'
        );
        
        const oob_url = await response.text();
        console.log(oob_url)
        const encodedMsg = oob_url.split("=")[1]
        const decodedMsg = JSON.parse(Buffer.from(encodedMsg, 'base64').toString('ascii'))
        const mediatorDID = decodedMsg.from
        console.log("Mediator DID: "+ mediatorDID )


        const pingBody = { response_requested: true }
        const pingMsgPacked = DIDCommV2Module.pack(
          pingBody,
          id = uuid.v4(),
          to = mediatorDID, 
          from = myPeerDID, 
          messageType = "https://didcomm.org/trust-ping/2.0/ping",
          // customHeaders = [{return_route: "all"}],
          agreemKey = myAgreemKey, 
          signFrom = null, 
          protectSender = false
        )
        console.log(pingMsgPacked)
        const resp2 = fetch('http://127.0.0.1:8000/', {
          method: 'POST',
          headers: {'Content-Type': 'application/didcomm-encrypted+json'},
          body: pingMsgPacked
        });
          

      } catch (error) {
        console.error(error);
      }


    }
    return (
        <View>
            <Text>Communications</Text>
            <Button
                title='Hello World'
                color='#841584'
                onPress={onPressHelloWorld}
            />
        <Text>Communications</Text>
        <Button
            title='Ping mediator'
            color='#841584'
            onPress={onPingMediator}
        />
    </View>
    );
};

export default Communications
