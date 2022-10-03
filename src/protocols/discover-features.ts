import {logger} from "../logging";
import { sendDIDCommMessage, pack } from "../didcommv2";

export async function discoverFeatures(from: string, to: string) {
    try {
        const msgPacked = await pack(
            {
                "queries": [
                    { "feature-type": "protocol", "match": "*" },
                ]
            }, 
            from, 
            to, 
            "https://didcomm.org/discover-features/2.0/queries", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendDIDCommMessage(msgPacked, to)
    } catch (error: any) {
        logger("discover features - Error", error)
    }
}

// TODO Implement the correct search. Now is responding a harcoded msg
export async function discloseFeatures(from: string, to: string) {
    try {
        const msgPacked = await pack(
            {
                "disclosures": [
                    {
                        "feature-type": "protocol",
                        "id": "https://didcomm.org/basicmessage/2.0",
                    }
                ]
            }, 
            from, 
            to, 
            "https://didcomm.org/discover-features/2.0/queries", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendDIDCommMessage(msgPacked, to)
    } catch (error: any) {
        logger("discover features - Error", error)
    }
}

export async function receiveDiscoverFeatures(msg: any) {
    try {
        const type = JSON.parse(msg.message).type
        switch (type) {
            case "https://didcomm.org/discover-features/2.0/disclose":
                return JSON.parse(msg.message).body.disclosures
            case "https://didcomm.org/discover-features/2.0/queries":
                console.log("not implemented")
                return "NOT IMPLEMENTED"
            default:
                break;
        }
    } catch (error: any) {
        logger("discover features - Error", error)
    }
}