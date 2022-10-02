import {logger} from "../logging";
import { sendDIDCommMessage, pack } from "../didcommv2";
import {  publishTextMessage } from '../roots/peerConversation'


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
        return await sendDIDCommMessage(packedMsg, to)
    } catch (error: any) {
        logger("basicmessage - Error", error)
    }
}

export async function receiveBasicMessage(msg: any) {
    const content = JSON.parse(msg.message).body.content
    logger("Basic Message received:", content)
    const from = msg.from
    const to = msg.to
    await publishTextMessage(content, to, from)

    return content
}