import {logger} from "../logging";
import { sendMessage, pack } from "../didcommv2";

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
        return await sendMessage(pingMsgPacked, to)
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
        await sendMessage(pingMsgPacked, to)
    } catch (error: any) {
        logger("trust-ping - Error", error)
    }
}

export async function receivePing(msg: any) {
    try {
        console.log(JSON.stringify(msg))
        const type = JSON.parse(msg.message).type
        switch (type) {
            case "https://didcomm.org/trust-ping/2.0/ping-response":
                return "PING RECEIVED"
            case "https://didcomm.org/trust-ping/2.0/ping":
                const responseRequested = JSON.parse(msg.message).body.response_requested
                if (responseRequested) {
                    const from = msg.from
                    const to = msg.to
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