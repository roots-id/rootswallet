import {logger} from "../logging";
import { sendDIDCommMessage, pack } from "../didcommv2";
import {  publishTextMessage } from '../roots/peerConversation'


export async function prismConnectionRequest(from: string, to: string, thid?:string) {
    try {
        const body = { "goal_code": "Connect","goal":"Connect","accept":["didcomm/v2"] }

        const packedMsg = await pack(
            body, 
            from, 
            to, 
            "https://atalaprism.io/mercury/connections/1.0/request", 
            [{return_route: "all"}],
            null,
            true,
            null,
            thid
          )
        return await sendDIDCommMessage(packedMsg, to)
    } catch (error: any) {
        logger("basicmessage - Error", error)
    }
}

export async function prismConnectionResponse(msg: any) {
    const content = JSON.parse(msg.message)
    logger("Basic Message received:", content)
    const from = msg.from
    const to = msg.to
    await publishTextMessage("Connection accepted", to, from)

    return content
}