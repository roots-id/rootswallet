
import { Resolver, ResolverRegistry } from 'did-resolver'
import { resolveDIDPeer } from "../didpeer"

import web from 'web-did-resolver'
export async function resolveDid(did: string) {
    let webResolver = web.getResolver()
    const resolver = new Resolver({...webResolver} as ResolverRegistry)


    if (did.startsWith('did:web')){
        const didDocument = await resolver.resolve(did)
        return didDocument['didDocument']
    }
    else if (did.startsWith('did:peer')){
        const didDocument = await resolveDIDPeer(did)
        return didDocument
    }
    else {
        return null
    }   
}