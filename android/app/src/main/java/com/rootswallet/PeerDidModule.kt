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
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
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

    // Generate PeerDID acording to second algorithm https://identity.foundation/peer-did-method-spec/index.html#generation-method
    // authPubKey is ed25519 public key in JWK format
    // agreemPubKey is x25519 public key in JWK format
    // service
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun createDID(
        authPubKey: ReadableMap,
        agreemPubKey: ReadableMap,
        serviceEndpoint: String? = null,
        serviceRoutingKeys: ReadableArray? = null
        ): String {
        val authPublicKey = VerificationMaterialAuthentication(
                format = VerificationMaterialFormatPeerDID.JWK,
                type = VerificationMethodTypeAuthentication.JSON_WEB_KEY_2020,
                value = authPubKey.toHashMap()
            )

        val agreemPublicKey = VerificationMaterialAgreement(
                format = VerificationMaterialFormatPeerDID.JWK,
                type = VerificationMethodTypeAgreement.JSON_WEB_KEY_2020,
                value = agreemPubKey.toHashMap()
            )
        
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
        
        return createPeerDIDNumalgo2(
                signingKeys = listOf(authPublicKey),
                encryptionKeys = listOf(agreemPublicKey),
                service = null
            )
    }

    // Resolve PeerDID
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun resolveDID(did: String): String {
        // request DID Doc in JWK format
        val didDocJson = resolvePeerDID(did, format = VerificationMaterialFormatPeerDID.JWK)
        return didDocJson  
    }
}