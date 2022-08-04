import React, { useState } from 'react';
import { Button, View, Text, NativeModules, TextInput } from 'react-native';
import { randomBytes } from 'react-native-randombytes'
import { X25519KeyPair } from '@transmute/did-key-x25519';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import uuid from 'react-native-uuid';
import {Buffer} from "buffer";
const { PeerDidModule, DIDCommV2Module } = NativeModules;


const Mediator = (props) => {

    const [didToMediator, setDidToMediator] = useState('')
    const [keyToMediator, setKeyToMediator] = useState('')
    const [didTofriend, setDidToFriend] = useState('')
    const [keyTofriend, setKeyToFriend] = useState('')
    const [mediatorDID, setMediatorDID] = useState('')
    const [routingKey, setRoutingKey] = useState('')
    const [friendDID, setFriendDID] = useState('')
    const [myMessage, setMyMessage] = useState('')
    const [friendMessage, setFriendMessage] = useState('')

    const generateKeyPair = async (type) => {
        let keyGenerator = Ed25519KeyPair;
        if (type == 'x25519') { keyGenerator = X25519KeyPair }
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


    const getMediator = async () => {
        // GET Mediator OOB URL and decode mediator public DID. Can also be a QR scan (code in https://mediator.rootsid.cloud/oob_qrcode)
        try {
            const response = await fetch(
                'https://mediator.rootsid.cloud/oob_url'
            );

            const oob_url = await response.text();
            const encodedMsg = oob_url.split("=")[1]
            const decodedMsg = JSON.parse(Buffer.from(encodedMsg, 'base64').toString('ascii'))
            setMediatorDID(decodedMsg.from)

        } catch (error) {
            console.error(error);
        }


    }

    const requestMediate = async () => {
        try {
            // Create a DID Peer to connect to the mediator
            // DID and key generated must be persisted
            const myAuthKey = await generateKeyPair('ed25519')
            const myAgreemKey = await generateKeyPair('x25519')
            const  myDid = PeerDidModule.createDID(myAuthKey.publicJwk,myAgreemKey.publicJwk,null,null)
            setKeyToMediator(myAgreemKey)
            setDidToMediator(myDid)

            
            // Mediate request message
            const msgBody = {}
            const mediateRequestPacked = DIDCommV2Module.pack(
                msgBody,
                id = uuid.v4(),
                to = mediatorDID,
                from = myDid,
                messageType = "https://didcomm.org/coordinate-mediation/2.0/mediate-request",
                customHeaders = [{ return_route: "all" }],
                agreemKey = myAgreemKey,
                signFrom = null,
                protectSender = true,
                attachments = null
            )
            const resp = await fetch('https://mediator.rootsid.cloud/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
                body: mediateRequestPacked
            });
            const respPacked = await resp.json();
            const respUnpacked = DIDCommV2Module.unpack(respPacked, to = myDid, agreemKey = myAgreemKey)
            const respJson = JSON.parse(respUnpacked)
            console.log(respJson)
            setRoutingKey(respJson.body.routing_keys[0])
            // TODO GET ROTATED DID
            //setMediatorDID(respJson.from_prior.sub)


        } catch (error) {
            console.error(error);
        }


    }

    const generateDIDtoFriend = async () => {
        // 1- Create a new DID with mediator routing DID to show to friend
        // 2- Update DID in mediator
        
        try {
            // Create a DID Peer to connect to a friend
            // DID and key generated must be persisted
            const myAuthKey = await generateKeyPair('ed25519')
            const myAgreemKey = await generateKeyPair('x25519')
            const  myDid = PeerDidModule.createDID(myAuthKey.publicJwk,myAgreemKey.publicJwk,routingKey,null)
            setKeyToFriend(myAgreemKey)
            setDidToFriend(myDid)

            
            // KeyList update message
            const msgBody = {
                updates: [
                    {
                        recipient_key: myDid,
                        action: "add"
                    }
                ]
            }
            const keyListUpdatePacked = DIDCommV2Module.pack(
                msgBody,
                id = uuid.v4(),
                to = mediatorDID,
                from = didToMediator,
                messageType = "https://didcomm.org/coordinate-mediation/2.0/keylist-update",
                customHeaders = [{ return_route: "all" }],
                agreemKey = keyToMediator,
                signFrom = null,
                protectSender = true,
                attachments = null
            )
            const resp = await fetch('https://mediator.rootsid.cloud/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
                body: keyListUpdatePacked
            });
            const respPacked = await resp.json();
            const respUnpacked = DIDCommV2Module.unpack(respPacked, to = didToMediator, agreemKey = keyToMediator)
            const respJson = JSON.parse(respUnpacked)
            console.log(respJson)


        } catch (error) {
            console.error(error);
        }


    }

    const getMessages = async () => {
        // 1- Check message queue (status-request)
        // 2- get messages if any (delivery-request)
        
        try {
            // Status Request
            const msgBody = {}
            const statusRequestPacked = DIDCommV2Module.pack(
                msgBody,
                id = uuid.v4(),
                to = mediatorDID,
                from = didToMediator,
                messageType = "https://didcomm.org/messagepickup/3.0/status-request",
                customHeaders = [{ return_route: "all" }],
                agreemKey = keyToMediator,
                signFrom = null,
                protectSender = true,
                attachments = null
            )
            const resp = await fetch('https://mediator.rootsid.cloud/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
                body: statusRequestPacked
            });
            const respPacked = await resp.json();
            const respUnpacked = DIDCommV2Module.unpack(respPacked, to = didToMediator, agreemKey = keyToMediator)
            const respJson = JSON.parse(respUnpacked)
            const messageCount = respJson.body.message_count
            console.log(messageCount)
            if (messageCount === 0) {
                setFriendMessage("No Messages")
            } else {
                // Get one message from queue
                const msg2Body = {limit: 1}
                const deliveryRequestPacked = DIDCommV2Module.pack(
                    msg2Body,
                    id = uuid.v4(),
                    to = mediatorDID,
                    from = didToMediator,
                    messageType = "https://didcomm.org/messagepickup/3.0/delivery-request",
                    customHeaders = [{ return_route: "all" }],
                    agreemKey = keyToMediator,
                    signFrom = null,
                    protectSender = true,
                    attachments = null
                )
                const resp2 = await fetch('https://mediator.rootsid.cloud/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
                    body: deliveryRequestPacked
                });
                
                const resp2Packed = await resp2.json();
                const resp2Unpacked = DIDCommV2Module.unpack(resp2Packed, to = didToMediator, agreemKey = keyToMediator)
                const resp2UnpackedJson = JSON.parse(resp2Unpacked)
                // Unpack friend message
                const friendMsgPacked = resp2UnpackedJson.attachments[0].data.json
                const friendMsgPackedId = resp2UnpackedJson.attachments[0].id
                const friendMsgUnPacked = DIDCommV2Module.unpack(JSON. stringify(friendMsgPacked), to = didTofriend, agreemKey = keyTofriend)

                setFriendMessage(JSON.parse(friendMsgUnPacked).body.content)

                // Acknowledge receipt
                const msg3Body = {"message_id_list": [friendMsgPackedId]}
                const ackPacked = DIDCommV2Module.pack(
                    msg3Body,
                    id = uuid.v4(),
                    to = mediatorDID,
                    from = didToMediator,
                    messageType = "https://didcomm.org/messagepickup/3.0/messages-received",
                    customHeaders = [{ return_route: "all" }],
                    agreemKey = keyToMediator,
                    signFrom = null,
                    protectSender = true,
                    attachments = null,
                    attachments = null
                )
                const resp3 = await fetch('https://mediator.rootsid.cloud/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
                    body: ackPacked
                });

            }

            


        } catch (error) {
            console.error(error);
        }


    }

    const sendMessage = async () => {
        // Send Message to DID via routing
        const friendDIDDoc = JSON.parse(PeerDidModule.resolveDID(friendDID))
        const friendServiceEndpoint = friendDIDDoc.service[0].serviceEndpoint
        console.log(friendServiceEndpoint)
        const friendMediatorDIDDoc = JSON.parse(PeerDidModule.resolveDID(friendServiceEndpoint))
        const friendMediatorServiceEndpoint = friendMediatorDIDDoc.service[0].serviceEndpoint
        console.log()
        try {

            
            // Basic Message to friend
            const msgBody = { content: myMessage }
            const myMsgPacked = DIDCommV2Module.pack(
                msgBody,
                id = uuid.v4(),
                to = friendDID,
                from = didTofriend,
                messageType = "https://didcomm.org/basicmessage/2.0/message",
                customHeaders = [{ created_time: Math.floor(new Date().getTime()/1000)}],
                agreemKey = keyTofriend,
                signFrom = null,
                protectSender = true,
                attachments = null
            )
            // wrap in a forward message
            const fwBody = { next: friendDID }
            const fwPacked = DIDCommV2Module.pack(
                fwBody,
                id = uuid.v4(),
                to = friendServiceEndpoint,
                from = didToMediator,  //this assume we are using same mediator, if not a new did should be created
                messageType = "https://didcomm.org/routing/2.0/forward",
                customHeaders = [{ return_route: "all" }],
                agreemKey = keyToMediator,
                signFrom = null,
                protectSender = true,
                attachments = [JSON.parse(myMsgPacked)]
            )

            const resp = await fetch(friendMediatorServiceEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
                body: fwPacked
            });
            console.log(resp.ok)


        } catch (error) {
            console.error(error);
        }


    }

    return (
        <View>
            <Button
                title='Scan Mediator QR'
                color='#239B56'
                onPress={getMediator}
            />
            <Text>{mediatorDID}</Text>
            <Button
                title='Request Mediate'
                color='#239B56'
                onPress={requestMediate}
            />
            <Text>
                {routingKey}
            </Text>
            <Button
                title='Generate DID to friend'
                color='#239B56'
                onPress={generateDIDtoFriend}
            />
            <Text>
                {didTofriend}
            </Text>
            <Button
                title='Check Messages'
                color='#239B56'
                onPress={getMessages}
            />
            <Text>
                {friendMessage}
            </Text>
            <TextInput
                placeholder="Friend DID"
                value={friendDID}
                onChangeText={setFriendDID}
            />
            <TextInput
                placeholder="Message"
                value={myMessage}
                onChangeText={setMyMessage}
            />
            <Button
                title='Send Message'
                color='#239B56'
                onPress={sendMessage}
            />
        </View>
    );
};

export default Mediator