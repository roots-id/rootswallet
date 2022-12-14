package com.rootswallet
import android.content.Context
import android.os.Build
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.Promise
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
    @ReactMethod
    fun createDID(
        authPubKey: ReadableMap,
        agreemPubKey: ReadableMap,
        serviceEndpoint: String? = null,
        serviceRoutingKeys: ReadableArray? = null,
        promise: Promise
        ) {
            try{
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
                promise.resolve(createPeerDIDNumalgo2(
                        signingKeys = listOf(authPublicKey),
                        encryptionKeys = listOf(agreemPublicKey),
                        service = service
                    ))
            } catch (e: Throwable) {
                promise.reject("Error", e)
            }
       
    }

    // Resolve PeerDID
    @ReactMethod
    fun resolveDID(did: String, promise: Promise) {
        // request DID Doc in JWK format
        try {
            var doc = if (did.startsWith("did:peer") == true) {
            
            resolvePeerDID(did, format = VerificationMaterialFormatPeerDID.JWK)
            }
            else{
                println("did web to resolve $did")
            toJson(DIDDoc(
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
            println("resolved document is $doc")
            promise.resolve(doc)
        } catch (e: Throwable) {
            promise.reject("Error", e)
        }
         
    }
}