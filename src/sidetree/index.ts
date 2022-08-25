import { randomBytes } from 'react-native-randombytes';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import { Secp256k1KeyPair } from '@transmute/did-key-secp256k1'
import { IonRequest, LocalSigner } from '@decentralized-identity/ion-sdk';


import { saveItem, getItem } from '../store/';
import {logger} from "../logging";

//TODO UPDATE, RECOVERY

//TODO MOVE URL TO CONFIG
const nodeURL = 'https://testnet.sidetree-cardano.com';
// const nodeURL = 'http://192.168.86.38:3000';


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
        console.error("sidetree - Error", error)
    }
}

export async function createSideTreeDID(serviceEndpoint: string, serviceRoutingKeys: string[]) {
    try {
        const updateKey = await generateKeyPair('secp256k1'); // also supports Ed25519
        const recoveryKey = await generateKeyPair('secp256k1'); // also supports Ed25519
        const authenticationKey = await generateKeyPair('secp256k1'); // also supports Ed25519

        // Create you rW3C DID document
        const didDocument = {
        publicKeys: [
            {
                id: 'key-1',
                type: 'EcdsaSecp256k1VerificationKey2019',
                publicKeyJwk: authenticationKey.publicJwk,
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
        const createRequest = await IonRequest.createCreateRequest({
            recoveryKey: recoveryKey!.publicJwk,
            updateKey: updateKey!.publicJwk,
            document: didDocument
        });
        const resp = await fetch(nodeURL + '/operations', {
            method: 'POST',
            body: JSON.stringify(createRequest)
        });
        const respBody = await resp.json();
        const did = respBody.didDocument.id
        //store keys
        //FIXME keys are stored in one big object. Can be optimized
        const storeItem = {
            recoveryKey,
            updateKey,
            authenticationKey
        }
        await saveItem(did, JSON.stringify(storeItem))
        return did
    } catch (error: any) {
        console.error("sidetree - Error", error)
    }
}

export async function resolveSidetreeDID(did: string) {
    try {
        const resp = await fetch(nodeURL + '/identifiers/'+did);
        const respBody = await resp.json();
        return respBody
    } catch (error: any) {
        console.error("sidetree - Error", error)
    }
}

export async function deactivateSideTreeDID(did: string) {
    try {
        if (getItem(did) !== undefined){
            const keys = JSON.parse(getItem(did)!)
            const recoveryKey = keys.recoveryKey

            const deactivateRequest = await IonRequest.createDeactivateRequest({
                didSuffix: did.split(":")[2],
                recoveryPublicKey: recoveryKey.publicJwk,
                signer: LocalSigner.create(recoveryKey.privateJwk)
            });
            const resp = await fetch(nodeURL + '/operations', {
                method: 'POST',
                body: JSON.stringify(deactivateRequest)
            });
            return resp.status;
        }
    } catch (error: any) {
        console.error("sidetree - Error", error)
    }
}

export async function updateSideTreeDID(did: string, serviceEndpoint: string, serviceRoutingKeys: string[]) {
    try {
        if (getItem(did) !== undefined){
            const keys = JSON.parse(getItem(did)!)
            const updateKey = keys.updateyKey

            //TODO allow update public keys and make update more general
            const updateOperation = {
                didSuffix: did.split(":")[2],
                idsOfPublicKeysToRemove: [],
                publicKeysToAdd: [],
                idsOfServicesToRemove: ['domain-1'],
                servicesToAdd: [{
                  id: 'some-service-2',
                  type: 'SomeServiceType',
                  serviceEndpoint: 'http://www.example.com'
                }]
              };

            const updateRequest = await IonRequest.createUpdateRequest({
            didSuffix: updateOperation.didSuffix,
            updatePublicKey: updateKey.publicJwk,
            nextUpdatePublicKey: updateKey.publicJwk, // it's recommended to change that key on each update
            signer: LocalSigner.create(updateKey.privateJwk),
            idsOfServicesToRemove: updateOperation.idsOfServicesToRemove,
            servicesToAdd: updateOperation.servicesToAdd,
            idsOfPublicKeysToRemove: updateOperation.idsOfPublicKeysToRemove,
            publicKeysToAdd: updateOperation.publicKeysToAdd
            });
            const resp = await fetch(nodeURL + '/operations', {
                method: 'POST',
                body: JSON.stringify(updateRequest)
            });
            return resp.status;
        }
    } catch (error: any) {
        console.error("sidetree - Error", error)
    }
}

export async function recoverSideTreeDID(did: string) {
    try {
        if (getItem(did) !== undefined){
            const keys = JSON.parse(getItem(did)!)
            const recoveryKey = keys.recoveryKey
            const newRecoveryKey = await generateKeyPair('secp256k1')
            const newUpdateKey = await generateKeyPair('secp256k1')
            const newAuthenticationKey = await generateKeyPair('secp256k1')
            const didDocument = {
                publicKeys: [
                  {
                    id: 'key-1',
                    type: 'EcdsaSecp256k1VerificationKey2019',
                    publicKeyJwk: newAuthenticationKey.publicJwk,
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

            const recoveryRequest = await IonRequest.createRecoverRequest({
            didSuffix: did.split(":")[2],
            signer: LocalSigner.create(recoveryKey.privateJwk),
            recoveryPublicKey: recoveryKey.publicJwk,
            nextRecoveryPublicKey: newRecoveryKey.publicJwk,
            nextUpdatePublicKey: newUpdateKey.publicJwk,
            document: didDocument
            });

            const resp = await fetch(nodeURL + '/operations', {
                method: 'POST',
                body: JSON.stringify(recoveryRequest)
            });
            const storeItem = {
                recoveryKey: newRecoveryKey,
                updateKey: newUpdateKey,
                authenticationKey: newAuthenticationKey
            }
            await saveItem(did, JSON.stringify(storeItem))

            return resp.status;
        }
    } catch (error: any) {
        console.error("sidetree - Error", error)
    }
}