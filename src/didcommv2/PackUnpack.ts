import { NativeModules } from 'react-native';
import { getItem } from '../store/';
import {logger} from "../logging";
import uuid from 'react-native-uuid';
import {resolveDid} from "./Resolve"

const { PeerDidModule, DIDCommV2Module } = NativeModules;

export async function pack(msg: any, from: string, to: string, messageType: string, customHeaders: any, signFrom: any, protectSender: boolean, attachments: any) {
    try {
        // TODO case with several key agreement in did doc
        // TODO pthid, thid
        const didDoc = await resolveDid(from)
        const kid = didDoc.keyAgreement[0].id
        const key = JSON.parse(await getItem(kid)!)
        var privateKey = key.privateJwk
        privateKey.kid = kid
        var packed = await DIDCommV2Module.pack(
            msg, 
            uuid.v4(), 
            to, 
            from, 
            messageType,
            customHeaders,
            privateKey, 
            signFrom, 
            protectSender,
            attachments
          )
        return packed
    } catch (error: any) {
        logger("didcomm - Pack error", error)
    }
}

export async function unpack(packMsg: any) {
    try {
        // TODO case with several key agreement in did doc
        console.log("RM HERE")
        console.log(packMsg)
        const recipient = packMsg.recipients[0].header.kid.split("#")[0]
        const didDoc = await resolveDid(recipient)
        const kid = didDoc.keyAgreement[0].id
        const key = JSON.parse(await getItem(kid)!)
        var privateKey = key.privateJwk
        privateKey.kid = kid
        var unpacked = await DIDCommV2Module.unpack(
            JSON.stringify(packMsg), 
            privateKey, 
          )
        return unpacked
    } catch (error: any) {
        logger("didcomm - Unpack error", error)
    }
}