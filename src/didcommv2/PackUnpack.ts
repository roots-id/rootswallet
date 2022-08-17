import { NativeModules } from 'react-native';
import { getItem } from '../store/';
import {logger} from "../logging";
import { resolveDIDPeer } from '../didpeer';
import uuid from 'react-native-uuid';

const { PeerDidModule, DIDCommV2Module } = NativeModules;

export async function pack(msg: any, from: string, to: string, messageType: string, customHeaders: any, signFrom: any, protectSender: boolean, attachments: any) {
    try {
        // TODO case with several key agreement in did doc
        // TODO pthid, thid
        const didDoc = await resolveDIDPeer(from)
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
        const recipient = JSON.parse(packMsg.toString()).recipients[0].header.kid.split("#")[0]
        const didDoc = await resolveDIDPeer(recipient)
        const kid = didDoc.keyAgreement[0].id
        const key = JSON.parse(await getItem(kid)!)
        var privateKey = key.privateJwk
        privateKey.kid = kid
        var unpacked = await DIDCommV2Module.unpack(
            packMsg, 
            privateKey, 
          )
        return unpacked
    } catch (error: any) {
        logger("didcomm - Unpack error", error)
    }
}