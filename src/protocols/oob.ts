import {logger} from "../logging";
import {Buffer} from "buffer";
import uuid from 'react-native-uuid';
import * as contact from '../relationships'
export async function generateOOBURL(from: string) {
    try {
        const msg = {
            type: "https://didcomm.org/out-of-band/2.0/invitation",
            id: uuid.v4(),
            from: from,
            body: { "accept": ["didcomm/v2"], "label": contact.getUserName() },
        }
        const msgstr = JSON.stringify(msg)
        const msgb64 = Buffer.from(msgstr).toString('base64')
        // TODO get base URL from mediator?
        const baseURL = "https://mediator.rootsid.cloud"
        return baseURL + "?_oob=" + msgb64
    } catch (error: any) {
        logger("oob - Error ",error)
    }
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
