import {logger} from "../logging";
import { sendDIDCommMessage, pack } from "../didcommv2";
import {  publishTextMessage, publishGenericMessage } from '../roots/peerConversation'
import { MessageType } from "../roots";
import { Buffer } from "buffer";
import jwt_decode from "jwt-decode";



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

export async function credentialPrism2Request(from: string, to: string, thid: string) {

    try {
        const msgPacked = await pack(
            {
                "goal_code": "issue-credential",
                "formats":[],
            }, 
            from, 
            to, 
            "https://didcomm.org/issue-credential/2.0/request-credential", 
            [{return_route: "all"}],
            null,
            true,
            null,
            thid
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
            case "https://didcomm.org/issue-credential/3.0/offer-credential":
                console.log(msg)
                console.log(JSON.parse(msg.message).attachments[0].data.json)
                return JSON.parse(msg.message).attachments[0].data.json
            case "https://didcomm.org/issue-credential/2.0/issue-credential":
                console.log("ATALA CREDENTIAL")
                const credJWT = JSON.parse(Buffer.from(JSON.parse(msg.message).attachments[0].data.base64, 'base64').toString('ascii'))
                const cred = jwt_decode(credJWT)
                console.log(cred.vc)
                await publishGenericMessage("Credential received",MessageType.AP2_CREDENTIAL_ISSUED,cred.vc,msg.to,msg.from)
                break
            case "https://didcomm.org/issue-credential/2.0/offer-credential":
                await publishGenericMessage("Credential offer received",MessageType.AP2_CREDENTIAL_OFFER,JSON.parse(msg.message),msg.to,msg.from)
                break;
            default:
                break;
        }
    } catch (error: any) {
        logger("coordinate-mediation - Error", error)
    }
}
