import {logger} from "../logging";
import { unpack } from "./PackUnpack";
import {receivePing, receiveBasicMessage, receiveMediate, receivePickup, receiveCredential, receiveShortenedURL} from "../protocols"

export async function receiveMessage(packMsg: any) {
    try {
        const unpacked = await unpack(packMsg)
        // TODO Process from_prior, thid y pthid
        // TODO return errors
        const type = JSON.parse(unpacked.message).type
        logger(type)
        // Message dispatch
        switch (type) {
            case type.startsWith('https://didcomm.org/trust-ping/2.0') ? type : '' :
                return await receivePing(unpacked)
                break;
            case type.startsWith('https://didcomm.org/basicmessage/2.0') ? type : '' :
                return await receiveBasicMessage(unpacked)
                break;       
            case type.startsWith('https://didcomm.org/coordinate-mediation/2.0/') ? type : '' :
                return await receiveMediate(unpacked)
                break; 
            case type.startsWith('https://didcomm.org/messagepickup/3.0/') ? type : '' :
                return await receivePickup(unpacked)
                break; 
            case type.startsWith('https://didcomm.org/issue-credential/3.0/') ? type : '' :
                return await receiveCredential(unpacked)
                break; 
            case type.startsWith('https://didcomm.org/shorten-url/1.0/') ? type : '' :
                return await receiveShortenedURL(unpacked)
                break; 
            default:
                return unpacked
                break;
        }
    } catch (error: any) {
        logger("mesageReceiver - Error", error)
    }
}