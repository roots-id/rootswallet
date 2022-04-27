package com.rootswallet

import android.annotation.SuppressLint
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.rootsid.wal.library.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import java.util.*
import kotlin.concurrent.thread

class PrismModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    //var wal:Wallet = newWallet("wallet1","","passphrase")

    override fun getName(): String {
        return "PrismModule"
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun test() {Log.d("test","test")}

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun testNode() {
        val wal = newWallet("walletname1", "", "password1")
        val didAlias1 = "didAlias1"
        val walAfterDid = newDid(wal, didAlias1, true)
        Log.d("LANCETAG", "Testing node publish....")
        val output = publishDid(walAfterDid, didAlias1).toString()
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun newDID(walJson: String, didAlias: String): String {
        var cliWal = Json.decodeFromString<Wallet>(walJson);
        cliWal = newDid(cliWal, didAlias, true);
        return Json.encodeToString(cliWal)
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun newWal(name: String, mnemonic: String, passphrase: String): String {
        val cliWal = newWallet(name,mnemonic,passphrase);
        return Json.encodeToString<Wallet>(cliWal);
    }

    @ReactMethod
    fun publishDid(walJson: String, didAlias: String, promise: Promise) {
        Log.d("PRISM_TAG","Publishing "+didAlias+" from wallet "+walJson);
        thread(start = true) {
            try {
                //                Thread.sleep(10000);

                var cliWal = Json.decodeFromString<Wallet>(walJson);
                cliWal = publishDid(cliWal, didAlias);
                var newWalJson = Json.encodeToString(cliWal)
                Log.d("PRISM_TAG","Published "+didAlias+" from wallet "+newWalJson)
                promise.resolve(newWalJson);
            } catch (e: Exception) {
                promise.reject("Publish Error", e);
            }
        }
    }

    @ReactMethod
    fun issueCred(walJson: String, didAlias: String, credJson: String, promise: Promise) {
        Log.d("PRISM_TAG","Issuing credential for "+didAlias+" from wallet "+walJson);
        thread(start = true) {
            try {
                var cliWal = Json.decodeFromString<Wallet>(walJson);
                val cliCred = Json.decodeFromString<IssuedCredential>(credJson);
                cliWal = issueCredential(cliWal, didAlias, cliCred)
                var newWalJson = Json.encodeToString(cliWal)
                Log.d("PRISM_TAG","Credential "+cliCred.verifiedCredential+" for did "+didAlias+" from wallet "+newWalJson)
                promise.resolve(newWalJson);
            } catch (e: Exception) {
                promise.reject("Publish Error", e);
            }
        }
    }

//    @ReactMethod
//    public void fetch(final String path, final Promise promise) {
//        new Thread(new Runnable() {
//            public void run() {
//                root.child(path)...
//            }
//        }).start();
//    }
}