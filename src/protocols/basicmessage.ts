import {logger} from "../logging";
import { sendMessage, pack } from "../didcommv2";
import { getChatItem, MessageType,importContact,getAllChats,sendMessages } from '../roots'
import * as contact from '../relationships'
import { constants } from "buffer";

export async function sendBasicMessage(content: string, from: string, to: string) {
    try {
        const body = { content: content }
        //FIXME created_time is not custom header in python, check in JVM

        const packedMsg = await pack(
            body, 
            from, 
            to, 
            "https://didcomm.org/basicmessage/2.0/message", 
            [{return_route: "all"}, {created_time: Math.floor(new Date().getTime()/1000)}],
            null,
            true,
            null
          )
        return await sendMessage(packedMsg, to)
    } catch (error: any) {
        logger("basicmessage - Error", error)
    }
}

export async function receiveBasicMessage(msg: any) {
    const content = JSON.parse(msg.message).body.content
    const relName = JSON.parse(msg.message).body.displayName
    const from = msg.from
    console.log('from basic message,', from)
    console.log('relName basic message,', relName)
    let chat = await getChatItem(relName)

    //if chat is undefined, create a new chat
    if (typeof chat === 'undefined') {
        await importContact({
            displayName: relName,
            displayPictureUrl: contact.prismLogo,
            did: from
        })
    }
    chat = await getChatItem(relName)
    logger('chatssssss', chat)
    const msgs = await sendMessages(chat, [content], 'textMsgType', 'RootsHelper')

    logger("Basic Message received:", content)
    return content
}