package com.rootswallet
import android.content.Context
import android.os.Build
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import java.util.*
import org.didcommx.didcomm.DIDComm
import org.didcommx.didcomm.message.Message
import org.didcommx.didcomm.message.Attachment
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
// import org.didcommx.peerdid.resolvePeerDID

class DIDCommV2Module(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        fun resolvePeerDID(did: String, format: VerificationMaterialFormatPeerDID) =
            org.didcommx.peerdid.resolvePeerDID(did, format)
    }

    override fun getName(): String {
        return "DIDCommV2Module"
    }

    @ReactMethod
    fun pack(
        body: ReadableMap,
        id: String,
        thid: String? = null,
        to: String,
        from: String,
        messageType: String = "my-protocol/1.0",
        customHeaders: ReadableArray,
        agreemKey: ReadableMap,
        signFrom: String? = null,
        protectSender: Boolean = false,
        attachments: ReadableArray? = null,
        promise: Promise
    ) {
        try {
            val secretsResolver = SecretResolverInMemoryMock()
            secretsResolver.addKey(jwkToSecret(agreemKey.toHashMap()))
            var didcommAttachments: MutableList<Attachment>? = null
            if (attachments != null) {
                didcommAttachments = mutableListOf<Attachment>()
                for (i in 0..attachments.size()-1) {
                    didcommAttachments.add(Attachment.builder(i.toString(), Attachment.Data.Json(attachments.getMap(i).toHashMap())
                    ).build())
                }
            }

            val didComm = DIDComm(DIDDocResolverPeerDID(), secretsResolver)
            val message = Message.builder(
                id = id,
                body = body.toHashMap(),
                type = messageType,
            )
                .from(from)
                .to(listOf(to))
                .thid(thid)
                .attachments(didcommAttachments)
                // .customHeader("return_route", "all")
                // .customHeader("return_route2", "all")
                .build()
                
            var builder = PackEncryptedParams
                .builder(message, to)
                // .from(from)
                .forward(false)
                .protectSenderId(protectSender)
            builder = from?.let { builder.from(it) } ?: builder
            builder = signFrom?.let { builder.signFrom(it) } ?: builder
            val params = builder.build()
            promise.resolve(didComm.packEncrypted(params).packedMessage)
        } catch (e: Throwable) {
            promise.reject("Error", e)
        }
    }

    @ReactMethod
    fun unpack(
            packedMsg: String, 
            agreemKey: ReadableMap,
            promise: Promise
        ) {
            try{
                val secretsResolver = SecretResolverInMemoryMock()
                secretsResolver.addKey(jwkToSecret(agreemKey.toHashMap()))
                val didComm = DIDComm(DIDDocResolverPeerDID(), secretsResolver)
                val res = didComm.unpack(UnpackParams.Builder(packedMsg).build())
                val map = Arguments.createMap();
                map.putString("message", res.message.toString());
                map.putString("fromPrior", res.message.fromPrior?.sub);
                map.putString("to", res.metadata.encryptedTo?.let { divideDIDFragment(it.first()).first() } ?: "")
                map.putString("from", res.metadata.encryptedFrom?.let { divideDIDFragment(it).first() })
                promise.resolve(map)
            } catch (e: Throwable) {
                promise.reject("Error", e)
            }
    }
}