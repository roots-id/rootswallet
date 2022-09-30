import {logger} from "../logging";
import { sendMessage, pack } from "../didcommv2";

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
        return await sendMessage(msgPacked, to)
    } catch (error: any) {
        logger("discover features - Error", error)
    }
}

// TODO IMPLEMENT DISCLOSE MY OWN FEATURES
// export async function discloseFeatures(from: string, to: string) {
//     try {
//         const msgPacked = await pack(
//             {
//                 "queries": [
//                     { "feature-type": "protocol", "match": "*" },
//                 ]
//             }, 
//             from, 
//             to, 
//             "https://didcomm.org/discover-features/2.0/queries", 
//             [{return_route: "all"}],
//             null,
//             true,
//             null
//           )
//         return await sendMessage(msgPacked, to)
//     } catch (error: any) {
//         logger("discover features - Error", error)
//     }
// }

export async function receiveDiscoverFeatures(msg: any) {
    try {
        const type = JSON.parse(msg.message).type
        switch (type) {
            case "https://didcomm.org/discover-features/2.0/disclose":
                return JSON.parse(msg.message).body.disclosures
            case "https://didcomm.org/discover-features/2.0/queries":
                console.log('QUERY NOT IMPLEMENTED')
                return "NOT IMPLEMENTED"
            default:
                break;
        }
    } catch (error: any) {
        logger("discover features - Error", error)
    }
}