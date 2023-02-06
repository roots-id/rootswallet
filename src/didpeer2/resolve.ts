import { Numalgo2Prefixes } from "./constants";
import type { IDIDDocument, IDIDDocumentServiceDescriptor, IDIDDocumentVerificationMethod } from "./interfaces";
import { assert, createDIDDocument, decodeService, isPeerDID } from "./utils";

export const resolve = async (did: string): Promise<IDIDDocument> => {
    assert(isPeerDID(did), `${did} is not a valid did:peer`)
    switch(did.slice(9,10)) {
        case '0':
            return resolveNumAlgo0(did);
        case '1':
            return resolveNumAlgo1(did);
        case '2':
            return resolveNumAlgo2(did);
        default:
            throw new Error(`numalgo ${did.slice(9,10)} not recognized`);
    }
}

export const resolveNumAlgo0 = async (did: string): Promise<IDIDDocument> => {
    const multibaseKey = did.slice(10)
    const key = {
        id: `${did}#${multibaseKey.slice(1)}`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: multibaseKey
    }
    return createDIDDocument(did, [key], [], []);
}

export const resolveNumAlgo1 = async (did: string): Promise<IDIDDocument> => {
    throw new Error('NumAlgo1 not supported')
}

export const resolveNumAlgo2 = async (did: string): Promise<IDIDDocument> => {
    let authKeys: IDIDDocumentVerificationMethod[] = [];
    let encKeys: IDIDDocumentVerificationMethod[] = [];
    let services: IDIDDocumentServiceDescriptor[] = [];
    let keys = did.split('.')
    let serviceIndex = 0;
    delete keys[0];
    keys.forEach(k => {
        switch (k.slice(0,1)) {
            case Numalgo2Prefixes.Authentication:
                authKeys.push({
                    id: `${did}#${k.slice(2)}`,
                    controller: did,
                    type: 'Ed25519VerificationKey2020',
                    publicKeyMultibase: k.slice(1)
                })
                break;
            case Numalgo2Prefixes.KeyAgreement:
                encKeys.push({
                    id: `${did}#${k.slice(2)}`,
                    controller: did,
                    type: 'X25519KeyAgreementKey2020',
                    publicKeyMultibase: k.slice(1)
                })
                break;
            case Numalgo2Prefixes.Service:
                services.push(decodeService(did, k.slice(1), serviceIndex))
                serviceIndex++;
                break;
        }
    })
    return createDIDDocument(did, authKeys, encKeys, services)
}