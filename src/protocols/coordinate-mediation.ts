import {logger} from "../logging";
import { sendDIDCommMessage, pack } from "../didcommv2";

export async function mediateRequest(from: string, to: string) {
    try {
        const msgPacked = await pack(
            {}, 
            from, 
            to, 
            "https://didcomm.org/coordinate-mediation/2.0/mediate-request", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendDIDCommMessage(msgPacked, to)
    } catch (error: any) {
        logger("coordinate-mediation - Error", error)
    }
}

export async function keylistUpdate(updates: any[], from: string, to: string) {
    try {
        const msgPacked = await pack(
            {updates: updates}, 
            from, 
            to, 
            "https://didcomm.org/coordinate-mediation/2.0/keylist-update", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendDIDCommMessage(msgPacked, to)
    } catch (error: any) {
        logger("coordinate-mediation - Error", error)
    }
}

export async function receiveMediate(msg: any) {
    try {
        const type = JSON.parse(msg.message).type
        switch (type) {
            case "https://didcomm.org/coordinate-mediation/2.0/mediate-grant":
                return JSON.parse(msg.message).body.routing_did
            case "https://didcomm.org/coordinate-mediation/2.0/mediate-deny":
                return "MEDIATE DENY"
            case "https://didcomm.org/coordinate-mediation/2.0/keylist-update-response":
                return JSON.parse(msg.message).body
                break;           
            default:
                break;
        }
    } catch (error: any) {
        logger("coordinate-mediation - Error", error)
    }
}