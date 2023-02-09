import { NativeModules } from 'react-native';
import { randomBytes } from 'react-native-randombytes'
import { X25519KeyPair } from '@transmute/did-key-x25519';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import { saveItem } from '../store/';
import {logger} from "../logging";
import * as AsyncStore from '../store/AsyncStore'
import {create, resolve} from '../didpeer2/'
import b58 from 'b58';


const { PeerDidModule } = NativeModules;

export async function generateKeyPair(type: string) {
    try {
        let keyGenerator = Ed25519KeyPair;
        if (type == 'x25519') { keyGenerator = X25519KeyPair }
        const keyPair = await keyGenerator.generate({
            secureRandom: () => randomBytes(32)
        });
        const { publicKeyJwk, privateKeyJwk } = await keyPair.export({
            type: 'JsonWebKey2020',
            privateKey: true,
        });
        return {
            publicJwk: publicKeyJwk,
            privateJwk: privateKeyJwk,
            publicKeyMultibase: keyPair.controller.split(':')[2]
        };
    } catch (error: any) {
        logger("didpeer - Error", error)
    }
}

export async function createDIDPeerOld(serviceEndpoint: string, serviceRoutingKeys: string[]) {
    try {
        const authKey = await generateKeyPair('ed25519')
        const agreemKey = await generateKeyPair('x25519')
        const peerDID = await PeerDidModule.createDID(authKey!.publicJwk,agreemKey!.publicJwk,serviceEndpoint,serviceRoutingKeys)
        
        const didDoc = await resolveDIDPeer(peerDID)
        // Store Authentication and Agreement Keys
        await saveItem(didDoc.authentication[0].id, JSON.stringify(authKey))
        await saveItem(didDoc.keyAgreement[0].id, JSON.stringify(agreemKey))

        await AsyncStore.storeItem(didDoc.authentication[0].id, JSON.stringify(authKey))
        await AsyncStore.storeItem(didDoc.keyAgreement[0].id, JSON.stringify(agreemKey))

        return peerDID
    } catch (error: any) {
        logger("didpeer - Error", error)
    }
}

export async function resolveDIDPeer(did: string) {
    try {
        const didDoc = await resolve(did)
        return didDoc     
    } catch (error: any) {
        logger("didpeer - Error", error)
    }
}


export async function createDIDPeer(serviceEndpoint: string, serviceRoutingKeys: string[]) {
    try {
        const authKey = await generateKeyPair('ed25519')
        const agreemKey = await generateKeyPair('x25519')
        const authenticationKey = {
            id: '#key-1',
            type: 'Ed25519VerificationKey2020',
            controller: 'did:peer:2:Bob',
            publicKeyMultibase: authKey!.publicKeyMultibase
        }
        const encryptionKey = {
            id: '#key-2',
            type: 'X25519KeyAgreementKey2020',
            controller: 'did:peer:2:Bob',
            publicKeyMultibase: agreemKey!.publicKeyMultibase
        }
        const service = {
            id: '#service-1',
            type: 'DIDCommMessaging',
            serviceEndpoint: serviceEndpoint
        }

        const peerDID = await create(2,[authenticationKey],[encryptionKey],service)
        const didDoc = await resolve(peerDID)
        // // Store Authentication and Agreement Keys
        await saveItem(didDoc.authentication![0] as string, JSON.stringify(authKey))
        await saveItem(didDoc.keyAgreement![0] as string, JSON.stringify(agreemKey))

        await AsyncStore.storeItem(didDoc.authentication![0] as string, JSON.stringify(authKey))
        await AsyncStore.storeItem(didDoc.keyAgreement![0] as string, JSON.stringify(agreemKey))


        return peerDID
    } catch (error: any) {
        logger("didpeer2 - Error", error)
    }

}

export async function resolveDIDPeerX25519ToPublicJwk(did:string) {
    try {
        const didDOc = await resolve(did)
        const verificationMethods = didDOc.verificationMethod
        let publicKeyBase64 = ''
        let kid = ''
        verificationMethods!.forEach((verificationMethod: any) => {
            if (verificationMethod.type == 'X25519KeyAgreementKey2020') {
                kid = verificationMethod.id
                const multibase =  verificationMethod.publicKeyMultibase
                const multicodec = b58.decode(multibase.substring(1))
                //publicKeyBase64 = multicodec.slice(2).toString('base64').replace(/=/g, '').replace("+", "-").replace("/", "_" )
                publicKeyBase64 = multicodec.slice(2).toString('base64').replace(/=/g, '').replace(new RegExp('+', 'g'), "-").replace(new RegExp('\/', 'g'), "_" )

            }
        })
    
        return {
            kty: "OKP",
            crv: "X25519",
            x: publicKeyBase64,
            kid: kid
        }
    } catch (error) {
        console.log(error)
    }

}



