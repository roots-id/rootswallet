package com.rootswallet
import android.content.Context
import android.os.Build
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.*
import io.iohk.atala.prism.api.*;
import io.iohk.atala.prism.api.node.*;
import io.iohk.atala.prism.crypto.derivation.KeyDerivation;
import io.iohk.atala.prism.crypto.derivation.MnemonicCode;
import io.iohk.atala.prism.crypto.keys.ECKeyPair;
import io.iohk.atala.prism.identity.*;
import io.iohk.atala.prism.protos.*;

class PrismModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PrismModule"
    }
    
    // Beware of the isBlocking. Need to fix with callback or alike
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun createDID(pass: String): String {
        val issuerKeys = prepareKeysFromMnemonic(KeyDerivation.randomMnemonicCode(), pass)
        val issuerUnpublishedDid = PrismDid.buildLongFormFromMasterPublicKey(issuerKeys[PrismDid.DEFAULT_MASTER_KEY_ID]?.publicKey!!)
        return issuerUnpublishedDid.toString()
    }


    fun prepareKeysFromMnemonic(mnemonic: MnemonicCode, pass: String): Map<String, ECKeyPair> {
       val seed = KeyDerivation.binarySeed(mnemonic, pass)
       val issuerMasterKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, PrismKeyType.MASTER_KEY, 0)
       val issuerIssuingKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, PrismKeyType.ISSUING_KEY, 0)
       val issuerRevocationKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, PrismKeyType.REVOCATION_KEY, 0)
       return mapOf(
           Pair(PrismDid.DEFAULT_MASTER_KEY_ID, issuerMasterKeyPair),
           Pair(PrismDid.DEFAULT_ISSUING_KEY_ID, issuerIssuingKeyPair),
           Pair(PrismDid.DEFAULT_REVOCATION_KEY_ID, issuerRevocationKeyPair))
   }
    
}