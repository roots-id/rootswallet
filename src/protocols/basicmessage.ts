import { NativeModules } from "react-native";
import {logger} from "../logging";
import { sendMessage, pack } from "../didcommv2";

export async function sendBasicMessage(content: string, from: string, to: string) {
    try {
        const body = { content: content }

        const packedMsg = await pack(
            body, 
            from, 
            to, 
            "https://didcomm.org/basicmessage/2.0/message", 
            [{return_route: "all"}, {created_time: Math.floor(new Date().getTime()/1000)}],
            null,
            true,
            null
          )
        return await sendMessage(packedMsg, to)
    } catch (error: any) {
        logger("basicmessage - Error", error)
    }
}

export async function receiveBasicMessage(msg: any) {
    return msg
}