import {logger} from "../logging";
import { receiveMessage } from "./MessageReceiver";
import {createDIDPeer, resolveDIDPeer} from "../didpeer"
import { pack } from "./PackUnpack";

export async function sendMessage(packMsg: any, to: string) {
    try {
        const didDoc = await resolveDIDPeer(to)
        var serviceEndpoint = didDoc.service[0].serviceEndpoint
        var packed = packMsg
        var endpoint = serviceEndpoint
        // TODO case when there are several nested forwards
        if (serviceEndpoint.startsWith("did:")) {
            const didDocNext = await resolveDIDPeer(serviceEndpoint)
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
        console.log("ServiceEndpoint:",endpoint)
        // TODO add WebSocket transport
        const resp = await fetch(endpoint, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/didcomm-encrypted+json'},
                    body: packed
                });
        const respmsg = await resp.json()
        if (respmsg !== null) {
            return await receiveMessage(respmsg)
        }
    } catch (error: any) {
        logger("mesageSender - Error", error)
    }
}