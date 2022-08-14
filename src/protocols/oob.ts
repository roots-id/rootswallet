import { NativeModules } from "react-native";
import {logger} from "../logging";
import {Buffer} from "buffer";


export async function generateOOBQRCode(did: string) {

}

export async function generateOOBURL(did: string) {

}

export async function decodeOOBURL(url: string) {
    try {
        const params = url.split(/([?,=])/)
        const index = params.indexOf('_oob')
        const encodedMsg = params[index + 2]
        return JSON.parse(Buffer.from(encodedMsg, 'base64').toString('ascii'))
    } catch (error: any) {
        logger("oob - Error decoding OOB URL", url,error)
    }

}
