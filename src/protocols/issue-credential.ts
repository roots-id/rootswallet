import {logger} from "../logging";
import { sendDIDCommMessage, pack } from "../didcommv2";


export async function credentialRequest(from: string, to: string, credential: any) {

    try {
        const msgPacked = await pack(
            {
                "goal_code": "issue-credential"
            }, 
            from, 
            to, 
            "https://didcomm.org/issue-credential/3.0/request-credential", 
            [{return_route: "all"}],
            null,
            true,
            [credential]
          )
        return await sendDIDCommMessage(msgPacked, to)
    } catch (error: any) {
        logger("issue-credential - Error", error)
    }
}

export async function receiveCredential(msg: any) {
    try {
        const type = JSON.parse(msg.message).type
        switch (type) {
            case "https://didcomm.org/issue-credential/3.0/issue-credential":
                
                console.log(JSON.parse(msg.message).attachments[0].data.json)
                return JSON.parse(msg.message).attachments[0].data.json
            default:
                break;
        }
    } catch (error: any) {
        logger("coordinate-mediation - Error", error)
    }
}
