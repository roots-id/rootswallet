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

    companion object {
        fun resolvePeerDID(did: String, format: VerificationMaterialFormatPeerDID) =
            org.didcommx.peerdid.resolvePeerDID(did, format)
    }

    override fun getName(): String {
        return "DIDCommV2Module"
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun pack(
        data: String,
        to: String,
        from: String,
        agreemKey: ReadableMap,
        signFrom: String? = null,
        protectSender: Boolean = true,
        messageType: String = "my-protocol/1.0"
    ): String {
        val secretsResolver = SecretResolverInMemoryMock()
        val didDoc = DIDDocPeerDID.fromJson(resolvePeerDID(from, VerificationMaterialFormatPeerDID.JWK))
        didDoc.agreementKids.zip(listOf(KeyPair(public = agreemKey.toHashMap()["publicJwk"] as Map<String, Any>, private = agreemKey.toHashMap()["privateJwk"] as Map<String, Any> ))).forEach {
            val privateKey = it.second.private.toMutableMap()
            privateKey["kid"] = it.first
            secretsResolver.addKey(jwkToSecret(privateKey))
            println(jwkToSecret(privateKey))
        }

        val didComm = DIDComm(DIDDocResolverPeerDID(), secretsResolver)
        val message = Message.builder(
            id = UUID.randomUUID().toString(),
            body = mapOf("msg" to data),
            type = messageType
        ).build()
        var builder = PackEncryptedParams
            .builder(message, to)
            .forward(false)
            .protectSenderId(protectSender)
        builder = from?.let { builder.from(it) } ?: builder
        builder = signFrom?.let { builder.signFrom(it) } ?: builder
        val params = builder.build()
        return didComm.packEncrypted(params).packedMessage
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun unpack(
            packedMsg: String, 
            to: String,
            agreemKey: ReadableMap,
        ): String {
        val didDoc = DIDDocPeerDID.fromJson(resolvePeerDID(to, VerificationMaterialFormatPeerDID.JWK))
        val secretsResolver = SecretResolverInMemoryMock()
        didDoc.agreementKids.zip(listOf(KeyPair(public = agreemKey.toHashMap()["publicJwk"] as Map<String, Any>, private = agreemKey.toHashMap()["privateJwk"] as Map<String, Any> ))).forEach {
            val privateKey = it.second.private.toMutableMap()
            privateKey["kid"] = it.first
            secretsResolver.addKey(jwkToSecret(privateKey))
        }
        val didComm = DIDComm(DIDDocResolverPeerDID(), secretsResolver)
        val res = didComm.unpack(UnpackParams.Builder(packedMsg).build())
        val msg = res.message.body["msg"].toString()
        val eto = res.metadata.encryptedTo?.let { divideDIDFragment(it.first()).first() } ?: ""
        val efrom = res.metadata.encryptedFrom?.let { divideDIDFragment(it).first() }
        return msg
    }
}