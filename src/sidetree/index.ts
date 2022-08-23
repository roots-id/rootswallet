import { randomBytes } from 'react-native-randombytes';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import {Secp256k1KeyPair} from '@transmute/did-key-secp256k1'
import {IonRequest} from '@decentralized-identity/ion-sdk';


import { saveItem } from '../store/';
import {logger} from "../logging";

//TODO MOVE TO CONFIG
//const nodeURL = 'https://testnet.sidetree-cardano.com/cardano';
const nodeURL = 'http://192.168.86.38:3000';


export async function generateKeyPair(type: string) {
    try {
        let keyGenerator = Secp256k1KeyPair;
        if (type === 'Ed25519') { keyGenerator = Ed25519KeyPair; };
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
        logger("sidetree - Error", error)
    }
}

export async function createSideTreeDID(serviceEndpoint: string, serviceRoutingKeys: string[]) {
    try {
        // Generate update and recovery keys for sidetree protocol
        // Should be stored somewhere, you'll need later for updates and recovery of your DID
        const updateKey = await generateKeyPair('secp256k1'); // also supports Ed25519
        console.log('Your update key:');
        console.log(updateKey);
        const recoveryKey = await generateKeyPair('secp256k1'); // also supports Ed25519
        console.log('Your recovery key:');
        console.log(recoveryKey);

        // Generate authentication key for the W3C DID Document
        // Should be stored somewhere, you'll need it later for your proofs
        const authnKeys = await generateKeyPair('secp256k1'); // also supports Ed25519
        console.log('Your DID authentication key:');
        console.log(authnKeys);

        // Create you rW3C DID document
        const didDocument = {
        publicKeys: [
            {
                id: 'key-1',
                type: 'EcdsaSecp256k1VerificationKey2019',
                publicKeyJwk: authnKeys.publicJwk,
                purposes: ['authentication']
            }
        ],
        services: [
            {
                id: 'domain-1',
                type: 'LinkedDomains',
                serviceEndpoint: 'https://foo.example.com'
            }
        ]
        };            

        // Create the request body ready to be posted in /operations of Sidetree API
        const createRequest = await IonRequest.createCreateRequest({
            recoveryKey: recoveryKey!.publicJwk,
            updateKey: updateKey!.publicJwk,
            document: didDocument
        });
        console.log('POST operation: ' + JSON.stringify(createRequest));

        // POST request body to Sidetree-Cardano node API
        const resp = await fetch(nodeURL + '/operations', {
            method: 'POST',
            body: JSON.stringify(createRequest)
        });
        const respBody = await resp.json();
        console.log('Your generated DID: ' + respBody.didDocument.id);
        return respBody.didDocument.id
    } catch (error: any) {
        logger("sidetree - Error", error)
    }
}

export async function resolveSidetreeDID(did: string) {
    try {
        const resp = await fetch(nodeURL + '/identifiers/'+did);
        const respBody = await resp.json();
        console.log('DID Document: ' + JSON.stringify(respBody));
        return respBody
    } catch (error: any) {
        logger("sidetree - Error", error)
    }
}