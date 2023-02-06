import { Numalgo2Prefixes } from "./constants";
import type { IDIDDocumentServiceDescriptor, IDIDDocumentVerificationMethod } from "./interfaces"
import { encodeService } from "./utils";
import { validateAuthentication, validateEncryption } from "./validators";

export const create = async (
    numalgo: number,
    authenticationKeys: IDIDDocumentVerificationMethod[],
    encryptionKeys?: IDIDDocumentVerificationMethod[],
    service?: IDIDDocumentServiceDescriptor
): Promise<string> => {
    switch (numalgo) {
        case 0:
            return createNumAlgo0(authenticationKeys[0]);
        case 1:
            return createNumAlgo1();
        case 2:
            return createNumAlgo2(authenticationKeys, encryptionKeys, service);
        default:
            throw new Error(`numalgo ${numalgo} not recognized`);
    }
}

export const createNumAlgo0 = async (authenticationKey: IDIDDocumentVerificationMethod): Promise<string> => {
    validateAuthentication(authenticationKey)
    return `did:peer:0${authenticationKey.publicKeyMultibase}`
}

export const createNumAlgo1 = async (): Promise<string> => {
    throw new Error('NumAlgo1 not supported')
}

export const createNumAlgo2 = async (
    authenticationKeys: IDIDDocumentVerificationMethod[],
    encryptionKeys?: IDIDDocumentVerificationMethod[],
    service?: IDIDDocumentServiceDescriptor
): Promise<string> => {
    authenticationKeys.forEach(k => validateAuthentication(k));
    encryptionKeys?.forEach(k => validateEncryption(k));
    const auth = authenticationKeys.map(k => `.${Numalgo2Prefixes.Authentication}${k.publicKeyMultibase}`)
    const enc = encryptionKeys ? encryptionKeys.map(k => `.${Numalgo2Prefixes.KeyAgreement}${k.publicKeyMultibase}`) : '';
    const serv = service ? encodeService(service) : '';
    return `did:peer:2${auth}${enc}${serv}`
}