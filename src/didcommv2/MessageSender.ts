import {logger} from "../logging";
import { receiveMessage } from "./MessageReceiver";
import {createDIDPeer} from "../didpeer"
import { pack } from "./PackUnpack";
import {resolveDid} from "./Resolve"

export async function sendDIDCommMessage(packMsg: any, to: string) {
    try {
        
        const didDoc = await resolveDid(to)
        console.log('didDocsendDIDCommMessage', didDoc)
        var serviceEndpoint = typeof didDoc.service[0].serviceEndpoint === 'string'? didDoc.service[0].serviceEndpoint : didDoc.service[0].serviceEndpoint[0].uri
        console.log('serviceEndpoint',serviceEndpoint)
        
        var packed = packMsg
        var endpoint = serviceEndpoint
        if (serviceEndpoint.startsWith("did:")){
            const didDocNext = await resolveDid(serviceEndpoint)
            endpoint = didDocNext.service[0].serviceEndpoint
            const newDID = await createDIDPeer(null,null)
            const fwBody = { next: to }
            packed = await pack(
                { next: to },
                newDID,
                serviceEndpoint,
                "https://didcomm.org/routing/2.0/forward",
                [],
                null,
                true,
                [JSON.parse(packMsg)]
            )
        }
        
        console.log('sending to', endpoint)
        // TODO add WebSocket transport
        const resp = await fetch(endpoint, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/didcomm-encrypted+json'},
                    body: packed
                });
        console.log('sent ',packMsg)
        const respmsg = await resp.json()
        console.log('response messageee',respmsg)
        if (respmsg !== null) {
            return await receiveMessage(respmsg)
        }
    } catch (error: any) {
        logger("mesageSender - Error", error)
    }
}
