package com.rootswallet
import android.content.Context
import android.os.Build
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.util.*
import org.didcommx.didcomm.DIDComm
import org.didcommx.didcomm.message.Message
import org.didcommx.didcomm.model.PackEncryptedParams
import org.didcommx.didcomm.model.PackEncryptedResult
import org.didcommx.didcomm.model.UnpackParams
import org.didcommx.didcomm.secret.*
import org.didcommx.peerdid.*
import org.didcommx.didcomm.utils.divideDIDFragment
import org.didcommx.didcomm.utils.toJson
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

class DIDCommV2Module(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    data class UnpackResult(
        val message: String,
        val from: String?,
        val to: String,
        val res: org.didcommx.didcomm.model.UnpackResult
    )

    companion object {
        fun resolvePeerDID(did: String, format: VerificationMaterialFormatPeerDID) =
            org.didcommx.peerdid.resolvePeerDID(did, format)
    }

    override fun getName(): String {
        return "DIDCommV2Module"
    }
    
    val secretsResolver = SecretResolverInMemoryMock()
    
    // Beware of the isBlocking. Need to fix with callback or alike
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun pack(
        data: String,
        to: String,
        from: String? = null
        // signFrom: String? = null,
        // protectSender: Boolean = true
    ): String {
        val didComm = DIDComm(DIDDocResolverPeerDID(), secretsResolver)
        val message = Message.builder(
            id = UUID.randomUUID().toString(),
            body = mapOf("msg" to data),
            type = "my-protocol/1.0"
        ).build()
        var builder = PackEncryptedParams
            .builder(message, to)
            .forward(false)
            .protectSenderId(true)
        builder = from?.let { builder.from(it) } ?: builder
        //builder = signFrom?.let { builder.signFrom(it) } ?: builder
        val params = builder.build()
        return didComm.packEncrypted(params).packedMessage
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun unpack(packedMsg: String): String {
        val didComm = DIDComm(DIDDocResolverPeerDID(), secretsResolver)
        val res = didComm.unpack(UnpackParams.Builder(packedMsg).build())
        val msg = res.message.body["msg"].toString()
        val eto = res.metadata.encryptedTo?.let { divideDIDFragment(it.first()).first() } ?: ""
        val efrom = res.metadata.encryptedFrom?.let { divideDIDFragment(it).first() }
        return msg
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun createPeerDID(
        authKeysCount: Int = 1,
        agreementKeysCount: Int = 1,
        serviceEndpoint: String? = null,
        //serviceRoutingKeys: List<String>? = null
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

        // 5. set KIDs as in DID DOC for secrets and store the secret in the secrets resolver
        val didDoc = DIDDocPeerDID.fromJson(resolvePeerDID(did, VerificationMaterialFormatPeerDID.JWK))
        didDoc.agreementKids.zip(x25519keyPairs).forEach {
            val privateKey = it.second.private.toMutableMap()
            privateKey["kid"] = it.first
            secretsResolver.addKey(jwkToSecret(privateKey))
        }
        didDoc.authenticationKids.zip(ed25519keyPairs).forEach {
            val privateKey = it.second.private.toMutableMap()
            privateKey["kid"] = it.first
            secretsResolver.addKey(jwkToSecret(privateKey))
        }

        return did
    }


}