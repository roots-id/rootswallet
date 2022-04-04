package com.rootswallet
import android.content.Context
import android.os.Build
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.NativeModule;
import java.util.*
import org.didcommx.peerdid.*
import org.didcommx.didcomm.secret.*
import org.didcommx.didcomm.utils.toJson
import org.didcommx.didcomm.utils.divideDIDFragment
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


class PeerDidModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PeerDidModule"
    }
    
    // Beware of the isBlocking. Need to fix with callback or alike
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun createDID(
        authKeysCount: Int = 1,
        agreementKeysCount: Int = 1,
        serviceEndpoint: String? = null,
        //serviceRoutingKey: List<String>? = null
    ): String {
        // 1. generate keys in JWK format
        val x25519keyPairs = (1..agreementKeysCount).map { generateX25519Keys() }
        val ed25519keyPairs = (1..authKeysCount).map { generateEd25519Keys() }

        // 2. prepare the keys for peer DID lib
        val authPublicKeys = ed25519keyPairs.map {
            VerificationMaterialAuthentication(
                format = VerificationMaterialFormatPeerDID.JWK,
                type = VerificationMethodTypeAuthentication.JSON_WEB_KEY_2020,
                value = it.public
            )
        }
        val agreemPublicKeys = x25519keyPairs.map {
            VerificationMaterialAgreement(
                format = VerificationMaterialFormatPeerDID.JWK,
                type = VerificationMethodTypeAgreement.JSON_WEB_KEY_2020,
                value = it.public
            )
        }

        // 3. generate service
        val service = serviceEndpoint?.let {
            toJson(
                DIDCommServicePeerDID(
                    id = "new-id",
                    type = SERVICE_DIDCOMM_MESSAGING,
                    serviceEndpoint = it,
                    routingKeys = null,
                    accept = listOf("didcomm/v2")
                ).toDict()
            )
        }

        // 4. call peer DID lib
        // if we have just one key (auth), then use numalg0 algorithm
        // otherwise use numalg2 algorithm
        val did = if (authPublicKeys.size == 1 && agreemPublicKeys.isEmpty() && service.isNullOrEmpty())
            createPeerDIDNumalgo0(authPublicKeys[0])
        else
            createPeerDIDNumalgo2(
                signingKeys = authPublicKeys,
                encryptionKeys = agreemPublicKeys,
                service = service
            )

        return did
    }

    // Beware of the isBlocking. Need to fix with callback or alike
    // @ReactMethod(isBlockingSynchronousMethod = true)
    // fun resolve(did: String): Optional<DIDDoc> {
    //     // request DID Doc in JWK format
    //     val didDocJson = resolvePeerDID(did, format = VerificationMaterialFormatPeerDID.JWK)
    //     val didDoc = DIDDocPeerDID.fromJson(didDocJson)

    //     didDoc.keyAgreement
    //     return Optional.ofNullable(
    //         DIDDoc(
    //             did = did,
    //             keyAgreements = didDoc.agreementKids,
    //             authentications = didDoc.authenticationKids,
    //             verificationMethods = (didDoc.authentication + didDoc.keyAgreement).map {
    //                 VerificationMethod(
    //                     id = it.id,
    //                     type = VerificationMethodType.JSON_WEB_KEY_2020,
    //                     controller = it.controller,
    //                     verificationMaterial = VerificationMaterial(
    //                         format = VerificationMaterialFormat.JWK,
    //                         value = toJson(it.verMaterial.value)
    //                     )
    //                 )
    //             },
    //             didCommServices = didDoc.service
    //                 ?.map {
    //                     when (it) {
    //                         is DIDCommServicePeerDID ->
    //                             DIDCommService(
    //                                 id = it.id,
    //                                 serviceEndpoint = it.serviceEndpoint ?: "",
    //                                 routingKeys = it.routingKeys ?: emptyList(),
    //                                 accept = it.accept ?: emptyList()
    //                             )
    //                         else -> null
    //                     }
    //                 }
    //                 ?.filterNotNull()
    //                 ?: emptyList()
    //         )
    //     )
    // }

    
}