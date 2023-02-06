import { Buffer } from 'buffer/index.js';
import { Numalgo2Prefixes, ServiceReplacements } from "./constants";
import type { IDIDDocumentServiceDescriptor, IDIDDocumentVerificationMethod } from "./interfaces";

export const assert = (exp: boolean, message: string) => {
    if(!Boolean(exp)) throw new Error(message || 'unknown assertion error');
}

export const base64 = {
	encode: (unencoded: any): string => {
		return Buffer.from(unencoded || '').toString('base64');
	},
	decode: (encoded: any): Uint8Array => {
		return new Uint8Array(Buffer.from(encoded || '', 'base64').buffer);
	}
};

export const utf8 = {
	encode: (unencoded: string): Uint8Array => {
		return new TextEncoder().encode(unencoded)
	},
	decode: (encoded: Uint8Array): string => {
		return new TextDecoder().decode(encoded);
	} 
}

export const base64url = {
	encode: (unencoded: any): string => {
		var encoded = base64.encode(unencoded);
		return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
	},
	decode: (encoded: any): Uint8Array => {
		encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
		while (encoded.length % 4) encoded += '=';
		return base64.decode(encoded);
	}
};

export const encodeService = (service: IDIDDocumentServiceDescriptor): string => {
    let encoded = JSON.stringify(service)
    Object.values(ServiceReplacements).forEach((v: string, idx: number) => {
        encoded = encoded.replace(Object.keys(ServiceReplacements)[idx], v)
    })
    return `.${Numalgo2Prefixes.Service}${base64url.encode(encoded)}`
}

export const decodeService = (did: string, service: string, index: number): IDIDDocumentServiceDescriptor => {
    let val = JSON.parse(utf8.decode(base64url.decode(service)))
    if (val.r) {
        val['routingKeys'] = val.r;
        delete val['r']
    }
    if (val.a) {
        val['accept'] = val.a;
        delete val['a'];
    }
    if (val.t) {
        if (val.t === 'dm') {
            val.type = 'DIDCommMessaging'
            val.id = `#didcommmessaging-${index}`
        } else {
            val.type = val.t;
            val.id = `#service-${index}`
        }
        delete val['t']
    }
    if (val.s) {
        val['serviceEndpoint'] = val.s;
        delete val['s']
    }
    return val;
}

export const isPeerDID = (did: string) => {
    return new RegExp('^did:peer:(([01](z)([1-9a-km-zA-HJ-NP-Z]*))|(2((\.[AEVID](z)([1-9a-km-zA-HJ-NP-Z]*))+(\.(S)[0-9a-zA-Z=]*)?)))$').test(did)
}

export const createDIDDocument = (
    did: string,
    authKeys: IDIDDocumentVerificationMethod[],
    encKeys: IDIDDocumentVerificationMethod[],
    services: IDIDDocumentServiceDescriptor[]
) => {
    let contexts = ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/ed25519-2020/v1"]
    const auth = authKeys.map(k => k.id);
    const enc = encKeys.map(k => k.id);
    const ver = [...authKeys, ...encKeys].map(k => ({
        id: k.id,
        type: k.type,
        controller: k.controller,
        publicKeyMultibase: k.publicKeyMultibase
    }))
    let doc: any = {
        "id": did,
        assertionMethod: auth,
        authentication: auth,
        capabilityDelegation: auth,
        capabilityInvocation: auth,
        verificationMethod: ver,
    }
    if (enc.length > 0) {
        doc['keyAgreement'] = enc;
        contexts.push("https://w3id.org/security/suites/x25519-2020/v1");
    }
    if (services.length > 0) {
        doc['service'] = services
    }
    return {"@context": contexts, ...doc};
}