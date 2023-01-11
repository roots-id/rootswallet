import { NativeModules } from 'react-native';
import { randomBytes } from 'react-native-randombytes'
import { X25519KeyPair } from '@transmute/did-key-x25519';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import { saveItem } from '../store/';
import {logger} from "../logging";
import * as AsyncStore from '../store/AsyncStore'


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
            privateJwk: privateKeyJwk
        };
    } catch (error: any) {
        logger("didpeer - Error", error)
    }
}

export async function createDIDPeer(serviceEndpoint: string, serviceRoutingKeys: string[]) {
    try {
        const authKey = await generateKeyPair('ed25519')
        const agreemKey = await generateKeyPair('x25519')
        const peerDID = await PeerDidModule.createDID(authKey!.publicJwk,agreemKey!.publicJwk,serviceEndpoint,serviceRoutingKeys)
        
        const didDoc = await resolveDIDPeer(peerDID)
        // Store Authentication and Agreement Keys
        await saveItem(didDoc.authentication[0].id, JSON.stringify(authKey))
        await saveItem(didDoc.keyAgreement[0].id, JSON.stringify(agreemKey))

        await AsyncStore.storeItem(didDoc.authentication[0].id, JSON.stringify(authKey))
        await AsyncStore.storeItem(didDoc.keyAgreement[0].id, JSON.stringify(authKey))

        return peerDID
    } catch (error: any) {
        logger("didpeer - Error", error)
    }
}

export async function resolveDIDPeer(did: string) {
    try {
        return  JSON.parse(await PeerDidModule.resolveDID(did))        
    } catch (error: any) {
        logger("didpeer - Error", error)
    }
}