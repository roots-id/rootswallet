package com.rootswallet

import org.didcommx.didcomm.common.VerificationMaterial
import org.didcommx.didcomm.common.VerificationMaterialFormat
import org.didcommx.didcomm.common.VerificationMethodType
import org.didcommx.didcomm.diddoc.DIDCommService
import org.didcommx.didcomm.diddoc.DIDDoc
import org.didcommx.didcomm.diddoc.DIDDocResolver
import org.didcommx.didcomm.diddoc.VerificationMethod
import org.didcommx.didcomm.utils.toJson
import org.didcommx.peerdid.DIDCommServicePeerDID
import org.didcommx.peerdid.DIDDocPeerDID
import org.didcommx.peerdid.VerificationMaterialFormatPeerDID
import org.didcommx.peerdid.resolvePeerDID
import java.util.*

class DIDDocResolverPeerDID : DIDDocResolver {

    override fun resolve(did: String): Optional<DIDDoc> {
        println("DIDDocResolverPeerDID: resolve: $did")

        //check if did starts with did:peer next check if starts with did
        var doc = if (did.startsWith("did:peer") == true) {
            
            val didDocJson = resolvePeerDID(did, format = VerificationMaterialFormatPeerDID.JWK)
            val didDoc = DIDDocPeerDID.fromJson(didDocJson)

            Optional.ofNullable(
                DIDDoc(
                    did = did,
                    keyAgreements = didDoc.agreementKids,
                    authentications = didDoc.authenticationKids,
                    verificationMethods = (didDoc.authentication + didDoc.keyAgreement).map {
                        VerificationMethod(
                            id = it.id,
                            type = VerificationMethodType.JSON_WEB_KEY_2020,
                            controller = it.controller,
                            verificationMaterial = VerificationMaterial(
                                format = VerificationMaterialFormat.JWK,
                                value = toJson(it.verMaterial.value)
                            )
                        )
                    }, emptyList()
                )
            )
        }
        else{
            Optional.ofNullable(
                DIDDoc(
                    did="did:web:verifiable.ink", 
                    keyAgreements=listOf("did:web:verifiable.ink#1"), 
                    authentications=listOf("did:web:verifiable.ink#0"), 
                    verificationMethods=listOf(
                        VerificationMethod(
                            id="did:web:verifiable.ink#0", 
                            type=VerificationMethodType.JSON_WEB_KEY_2020, 
                            controller="did:web:verifiable.ink", 
                            verificationMaterial=VerificationMaterial(
                                format=VerificationMaterialFormat.JWK, 
                                value=toJson("{'kty': 'OKP', 'crv': 'Ed25519', 'x': '_8eE3ndcEzkNMchUiAaq0NpD4HKC3tKzzbwEmnu0o5o', 'kid': '3587c0177e124eb1b652fa02ac7b3fc1'}")
                            )
                        ), 
                        VerificationMethod(
                            id="did:web:verifiable.ink#1", 
                            type=VerificationMethodType.JSON_WEB_KEY_2020, 
                            controller="did:web:verifiable.ink", 
                            verificationMaterial=VerificationMaterial(
                                format=VerificationMaterialFormat.JWK, 
                                value=toJson("{'kty': 'OKP', 'crv': 'X25519', 'x': 'vT4QDzE-s4vTAi9tcouS-3EX70hf-85-yeIg_yEtjV0', 'kid': '13a70f1665a3430596c758e696a93369'}")
                            )
                        )
                    ), 
                    didCommServices=listOf(
                        DIDCommService(
                            id="did:web:verifiable.ink#didcomm", 
                            serviceEndpoint="https://verifiable.ink/didcomm", 
                            routingKeys=emptyList(), 
                            accept=listOf("didcomm/v2"))
                    )
                )
            )
        }
        return doc
    }
}