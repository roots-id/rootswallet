import React, { useState } from 'react';
import { Button, View, Text, NativeModules, TextInput } from 'react-native';
import { createDIDPeer} from '../didpeer'
import { decodeOOBURL, generateOOBURL, sendBasicMessage, mediateRequest, keylistUpdate, retrieveMessages } from '../protocols';

const { PeerDidModule, DIDCommV2Module } = NativeModules;

const Mediator = (props) => {

    const [didToMediator, setDidToMediator] = useState('')
    //const [keyToMediator, setKeyToMediator] = useState('')
    const [didTofriend, setDidToFriend] = useState('')
    const [keyTofriend, setKeyToFriend] = useState('')
    const [mediatorDID, setMediatorDID] = useState('')
    const [routingKey, setRoutingKey] = useState('')
    const [friendDID, setFriendDID] = useState('')
    const [myMessage, setMyMessage] = useState('')
    const [friendMessage, setFriendMessage] = useState('')

    const getMediator = async () => {
        // GET Mediator OOB URL and decode mediator public DID. Can also be a QR scan (code in https://mediator.rootsid.cloud/oob_qrcode)
        try {
            const response = await fetch(
                'https://mediator.rootsid.cloud/oob_url'
            );
            const oob_url = await response.text();
            const decodedMsg = await decodeOOBURL(oob_url)
            setMediatorDID(decodedMsg.from)
            
            // Create DID to communicate with Mediator
            const  myDid = await createDIDPeer(null,null)
            setDidToMediator(myDid)

        } catch (error) {
            console.error(error);
        }
    }

    const requestMediate = async () => {
        try {
            // Request mediate service and store routing key
            resp = await mediateRequest(didToMediator, mediatorDID)
            console.log(resp)
            setRoutingKey(resp)
        } catch (error) {
            console.error(error);
        }
    }

    const generateDIDtoFriend = async () => {
        // 1- Create a new DID with mediator routing DID to show to friend
        // 2- Update DID in mediator
        // 3- Generate OOB invitation to friend
        
        try {
            // 1- Create a DID Peer to connect to a friend
            const  myDid = await createDIDPeer(routingKey,null)
            setDidToFriend(myDid)

            // 2- KeyList update message
            const updates = [
                    {
                        recipient_key: myDid,
                        action: "add"
                    }
                ]
            const resp = await keylistUpdate(updates, didToMediator, mediatorDID)
            console.log(resp)
            
            //3- create OOB URL
            const ooburl = await generateOOBURL(myDid)

        } catch (error) {
            console.error(error);
        }
    }

    const getMessages = async () => {
        try {
            const resp = await retrieveMessages(didToMediator, mediatorDID)
           
            if (resp === 0) {
                setFriendMessage("No Messages")
            } else {
                setFriendMessage(resp)
            }
        } catch (error) {
            console.error(error);
        }
    }

    const sendMessage = async () => {
        try {    
            await sendBasicMessage(myMessage, didTofriend, friendDID)
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