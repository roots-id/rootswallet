import { NativeModules } from "react-native";
import {logger} from "../logging";
import { receiveMessage } from "./MessageReceiver";
const { PeerDidModule, DIDCommV2Module } = NativeModules;

export async function sendMessage(packMsg: any, to: string) {
    try {
        const didDoc = JSON.parse(await PeerDidModule.resolveDID(to))
        const serviceEndpoint = didDoc.service[0].serviceEndpoint
        console.log(serviceEndpoint)
        //TODO validate if URL or DID. If URL, get transport type. If DID, forward
        const resp = await fetch(serviceEndpoint, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/didcomm-encrypted+json'},
                    body: packMsg
                });
        // TODO VALIDATE IF THERE'S A RESPONSE
        const respmsg = await resp.json()
        return await receiveMessage(respmsg)
    } catch (error: any) {
        logger("mesageSender - Error", error)
    }
    
}