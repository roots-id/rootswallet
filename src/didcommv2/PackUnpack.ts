import { Platform, NativeModules } from 'react-native';
import { getItem } from '../store/';
import { resolveDIDPeer, resolveDIDPeerX25519ToPublicJwk } from '../didpeer';
import uuid from 'react-native-uuid';
import {logger} from "../logging";
import {getItem as getAsyncItem} from '../store/AsyncStore'
import {resolve} from '../didpeer2'
import { Dictionary } from 'tsyringe/dist/typings/types';


const { DIDCommV2Module, DIDCommModule } = NativeModules;

export async function pack(msg: any, from: string, to: string, messageType: string, customHeaders: any, signFrom: any, protectSender: boolean, attachments: any, thid?:string) {
    try {
        if (Platform.OS === 'android') {
            // TODO case with several key agreement in did doc
            // TODO pthid, thid
            // const didDoc = await resolveDIDPeer(from)
            // const kid = didDoc.keyAgreement[0].id
            // const _key = getItem(kid!) !== undefined ?  getItem(kid!) : await getAsyncItem(kid!)
            // const key = JSON.parse(_key!)
            // var privateKey = key.privateJwk
            // privateKey.kid = kid



            const didDoc = await resolve(from)
            const kid = didDoc.keyAgreement![0]
            const _key = getItem(kid! as string) !== undefined ?  getItem(kid! as string) : await getAsyncItem(kid! as string)
            const key = JSON.parse(_key!)
            var privateKey = key.privateJwk
            privateKey.kid = kid
            var packed = await DIDCommV2Module.pack(
                msg, 
                uuid.v4(), 
                typeof thid !== 'undefined' ? thid:null, 
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
        } else {
            const didDoc = await resolve(from)
            const kid = didDoc.keyAgreement![0]
            const _key = getItem(kid! as string) !== undefined ?  getItem(kid! as string) : await getAsyncItem(kid! as string)
            const key = JSON.parse(_key!)
            var privateKey = key.privateJwk
            privateKey.kid = kid

            var packed = await DIDCommModule.pack(
                JSON.stringify(msg),
                uuid.v4(),
                typeof thid !== 'undefined' ? thid:null,
                to,
                from,
                messageType,
                {},
                JSON.stringify(privateKey),
                false,
                false,
                attachments
            )
            return packed[0]

        }
        
    } catch (error: any) {
        logger("didcomm - Pack error", error)
    }
}

export async function unpack(packMsg: any) {
    try {
        if (Platform.OS === 'android') {
            // TODO case with several key agreement in did doc
            const recipient = packMsg.recipients[0].header.kid.split("#")[0]

            const didDoc = await resolve(recipient)
            const kid = didDoc.keyAgreement![0]
            const _key = getItem(kid! as string) !== undefined ?  getItem(kid! as string) : await getAsyncItem(kid! as string)
            const key = JSON.parse(_key!)
            var privateKey = key.privateJwk
            privateKey.kid = kid


            var unpacked = await DIDCommV2Module.unpack(
                JSON.stringify(packMsg), 
                privateKey, 
            )
            return unpacked
        } else {
            const recipient = packMsg.recipients[0].header.kid.split("#")[0]
            const didDoc = await resolve(recipient)
            const kid = didDoc.keyAgreement![0]
            const _key = getItem(kid! as string) !== undefined ?  getItem(kid! as string) : await getAsyncItem(kid! as string)
            const key = JSON.parse(_key!)
            var privateKey = key.privateJwk
            privateKey.kid = kid
            
            const unpacked = await DIDCommModule.unpack(JSON.stringify(packMsg),JSON.stringify(privateKey)) 
            return {
                message: JSON.stringify(unpacked[0]),
                from: unpacked[0].from,
                to: unpacked[0].to !== null ? unpacked[0].to[0] : null,
                // fromPrior: unpacked[1].fromPrior
            }

        }

        
        
    } catch (error: any) {
        logger("didcomm - Unpack error", error)
    }
}