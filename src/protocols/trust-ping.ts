import {logger} from "../logging";
import { sendDIDCommMessage, pack } from "../didcommv2";
import {  publishTextMessage } from '../roots/peerConversation'


export async function sendPing(from: string, to: string) {
    try {
        const pingBody = { response_requested: true }
        const pingMsgPacked = await pack(
            pingBody, 
            from, 
            to, 
            "https://didcomm.org/trust-ping/2.0/ping", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
          await publishTextMessage("Sending Trust-Ping", from, to)
        return await sendDIDCommMessage(pingMsgPacked, to)
    } catch (error: any) {
        logger("trust-ping - Error", error)
    }
}

export async function sendPingResponse(from: string, to: string) {
    try {
        // TODO ADD THID
        const pingMsgPacked = await pack(
            {}, 
            from, 
            to, 
            "https://didcomm.org/trust-ping/2.0/ping-response", 
            null,
            null,
            true,
            null
          )
        await sendDIDCommMessage(pingMsgPacked, to)
    } catch (error: any) {
        logger("trust-ping - Error", error)
    }
}

export async function receivePing(msg: any) {
    try {
        console.log(JSON.stringify(msg))
        const type = JSON.parse(msg.message).type
        const from = msg.from
        const to = msg.to
        switch (type) {
            case "https://didcomm.org/trust-ping/2.0/ping-response":
                await publishTextMessage("Trust-Ping response received", to, from)
                return "PING RECEIVED"
            case "https://didcomm.org/trust-ping/2.0/ping":

                await publishTextMessage("Trust-Ping received and responded", to, from)

                const responseRequested = JSON.parse(msg.message).body.response_requested
                if (responseRequested) {

                    await sendPingResponse(from, to)
                }
                break;           
            default:
                break;
        }

    } catch (error: any) {
        logger("trust-ping - Error", error)
    }
}