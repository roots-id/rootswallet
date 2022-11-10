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
        // request DID Doc in JWK format

        //check if did starts with "did:peer"
        if (did.startsWith("did:peer")=== true) {
            val didDocJson = resolvePeerDID(did, format = VerificationMaterialFormatPeerDID.JWK)
            val didDoc = DIDDocPeerDID.fromJson(didDocJson)

            didDoc.keyAgreement
            return Optional.ofNullable(
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
                    // didCommServices = didDoc.service
                    //     ?.map {
                    //         when (it) {
                    //             is DIDCommServicePeerDID ->
                    //                 DIDCommService(
                    //                     id = it.id,
                    //                     serviceEndpoint = it.serviceEndpoint ?: "",
                    //                     routingKeys = it.routingKeys ?: emptyList(),
                    //                     accept = it.accept ?: emptyList()
                    //                 )
                    //             else -> null
                    //         }
                    //     }
                    //     ?.filterNotNull()
                    //     ?: emptyList()
                )
            )
    }
    else {
        return Optional.ofNullable(
                    DIDDoc(
                        did = "did:web:verifiable.ink",
                        keyAgreements = listOf("did:web:verifiable.ink#1"),
                        authentications = listOf("did:web:verifiable.ink#0"),
                        verificationMethods = listOf(
                            VerificationMethod(
                                id="did:web:verifiable.ink#0",
                                type=VerificationMethodType.JSON_WEB_KEY_2020,
                                controller="did:web:verifiable.ink",
                                verificationMaterial=VerificationMaterial(
                                    format=VerificationMaterialFormat.JWK,
                                    
                                    value=toJson("""{
                                        "kty": "OKP",
                                        "crv": "Ed25519",
                                        "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo"
                                    }""")

                                )
                            ),
                            VerificationMethod(
                                id="did:web:verifiable.ink#1",
                                type=VerificationMethodType.JSON_WEB_KEY_2020,
                                controller="did:web:verifiable.ink",
                                verificationMaterial=VerificationMaterial(
                                    format=VerificationMaterialFormat.JWK,
                                    
                                    value=toJson("""{
                                        "kty": "OKP",
                                        "crv": "X25519",
                                        "x": "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo"
                                    }""")

                                )
                            )
                        ),
                        emptyList()
                        // didCommServices = listOf(
                        //     DIDCommService(
                        //         id="did:web:verifiable.ink#didcomm",
                        //         serviceEndpoint="https://verifiable.ink/didcomm",
                        //         routingKeys=null,
                        //         accept=listOf("didcomm/v2")
                        //     )
                        // )
                    )
            
                )
        }
    }
}

