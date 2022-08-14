import {logger} from "../logging";
import { unpack } from "./PackUnpack";
import {receivePing, receiveBasicMessage} from "../protocols"

export async function receiveMessage(packMsg: any) {
    try {
        const unpacked = await unpack(packMsg)
        
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
        
            default:
                return unpacked
                break;
        }
        
        

    } catch (error: any) {
        logger("mesageReceiver - Error", error)
    }
}