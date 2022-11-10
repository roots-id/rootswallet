import { NativeModules } from 'react-native';
import { getItem } from '../store/';
import {logger} from "../logging";
import uuid from 'react-native-uuid';
import {resolveDid} from "./Resolve"

// import {DIDComm, protocols} from '@aviarytech/didcomm'

const { PeerDidModule, DIDCommV2Module } = NativeModules;

// export const didcomm = new DIDComm([
//     new protocols.TrustPing.DefaultTrustPingMessageHandler,
//     new protocols.TrustPing.DefaultTrustPingResponseMessageHandler,
//     new protocols.BasicMessage.BasicMessageHandler(async (message, didcomm) => {
//         console.error(`~~~ basic message todo ~~~`)
//       }),
//       new protocols.Routing.RoutingForwardMessageHandler((async (message, didcomm) => {
//         console.error(`~~~ forward message todo ~~~`)
//       }))
//     ],
//     {
//         resolve: resolveDid
//     },
//     {
//         resolve: async (id) => ({} as any )
//       })
// export async function packv2(){}

export async function pack(msg: any, from: string, to: string, messageType: string, customHeaders: any, signFrom: any, protectSender: boolean, attachments: any) {
    try {
        // TODO case with several key agreement in did doc
        // TODO pthid, thid


        if (to.startsWith("did:web")){
            const didDoc = await resolveDid(to)
            console.log('didDocpack', didDoc)
            // const kid = didDoc.keyAgreement[0].id
            // const key = JSON.parse(await getItem(kid)!)
            // var privateKey = key.privateJwk
            privateKey= {
                "kty": "OKP",
                "crv": "X25519",
                "x": "3QJ2wXZQZdJLJr6hCg9vVZ7z6tSsV3r7Z9x9M5rZp7E",
            }

            var packed = await DIDCommV2Module.pack(
                msg, 
                uuid.v4(), 
                to, 
                from, 
                messageType,
                customHeaders,
                privateKey, 
                null,
                protectSender,
                attachments
              )
              console.log('packed', packed)
              return packed
            }
        else {
            const didDoc = await resolveDid(from)
            console.log('didDocpack peeer', didDoc)
            const kid = didDoc.keyAgreement[0].id
            const key = JSON.parse(await getItem(kid)!)
            var privateKey = key.privateJwk
            console.log('privateKey', privateKey)
            privateKey.kid = kid
            console.log('didcomm pack-', msg, from, to, messageType, customHeaders, signFrom, protectSender)
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
        }
        

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