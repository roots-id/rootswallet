import React from 'react';
import {Text, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {  createOOBInvitation } from '../roots/peerConversation';
import * as roots from '../roots';
import {asContactShareable, getContactByAlias, getUserId, ROOTS_BOT, showRel} from '../relationships';
import {useEffect, useState} from "@types/react";
import {displayOrHide} from "../styles/styles";
import {getChatItem, MessageType, sendMessage} from "../roots";

async function noMediatorPrompt(navigation) {
    const statusMsg = await sendMessage(getChatItem(getUserId()),
        "You are not connected to a mediator, please connect to one.  For instance you could scan a mediator QR Code",
        MessageType.TEXT,ROOTS_BOT)
    navigation.navigate('Chat', { chatId: getUserId()})
}

async function mediatorNotAccepted(navigation) {
    await sendMessage(getChatItem("mediator"),
        "Remember to request mediation?",
        MessageType.MEDIATOR_REQUEST_MEDIATE, ROOTS_BOT)
    navigation.navigate('Chat', { chatId: "mediator"})
}

async function hasMediator(navigation) {
    navigation.navigate("Show QR Code",{qrdata: await createOOBInvitation('mediator')})
}

async function chooseMediationNav(navigation) {
    if(await roots.getMediatorURL()=="") {
        await noMediatorPrompt(navigation)
    }else {
        if(getChatItem("mediator").mediator == undefined) {
            await mediatorNotAccepted(navigation)
        } else {
            await hasMediator(navigation)
        }
    }
}

export default function IconActions(...props) {
//  console.log("IconActions - props",props)
    const navigation = props[0]["nav"]
    const add = props[0]["add"]
    const person = props[0]["person"]
    const scan = props[0]["scan"]
    const settings = props[0]["settings"]
    const chat = props[0]["chat"]

//          <IconButton
//                icon="plus"
//                size={28}
//                color="#e69138"
//                onPress={() => navigation.navigate(add)}
//            />

    // useEffect(() => {
    //     console.log("IconActions - checking chat disabled")
    //     async function getMediator() {
    //         let url = await roots.getMediatorURL()
    //         console.log("IconActions - mediator url",url)
    //         setMediator(url)
    //         return url
    //     }
    //     getMediator()
    // }, [mediator])

    return (
        <View style={{flexDirection: 'row',}}>
            <IconButton
                icon="account"
                size={28}
                color="#e69138"
                onPress={() => showRel(navigation, asContactShareable(getContactByAlias(person)))}
            />
            <IconButton
                icon="qrcode-scan"
                size={28}
                color="#e69138"
                onPress={() => navigation.navigate("Scan QR Code", {type: scan})}
            />
            <IconButton
                icon="cog-outline"
                size={28}
                color="#e69138"
                onPress={() => navigation.navigate(settings)}
            />
            <IconButton
                icon="chat-plus-outline"
                size={28}
                color="#e69138"
                // TODO: disabled if getMediatorURL is an empty string else enabled
                disabled = {false}

                onPress={async () => await chooseMediationNav(navigation)}
                //convert single line async  onPress function to multi-line
                // onPress={async () => {
                //     const data = await createOOBInvitation('mediator')
                //     console.log("IconActions - data",data)
                //     navigation.navigate("Show QR Code",{qrdata: data})
                // }

            />
        </View>
    )
}
