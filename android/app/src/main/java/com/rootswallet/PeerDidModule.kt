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

    // Generate PeerDID according to the zero algorithm
    // https://identity.foundation/peer-did-method-spec/index.html#generation-method
    // pubKey is ed25519 public key for authetication with a peer. Must be in JWK format
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun createDID(pubKey: ReadableMap): String {
        val authPublicKey = VerificationMaterialAuthentication(
                format = VerificationMaterialFormatPeerDID.JWK,
                type = VerificationMethodTypeAuthentication.JSON_WEB_KEY_2020,
                value = pubKey.toHashMap()
            )
        return createPeerDIDNumalgo0(authPublicKey)
    }

    // Resolve PeerDID
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun resolveDID(did: String): String {
        // request DID Doc in JWK format
        val didDocJson = resolvePeerDID(did, format = VerificationMaterialFormatPeerDID.JWK)
        return didDocJson  
    }
}