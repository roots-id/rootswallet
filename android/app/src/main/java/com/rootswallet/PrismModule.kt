package com.rootswallet

import android.annotation.SuppressLint
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.rootsid.wal.library.*
//import io.iohk.atala.prism.api.*
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

    @ReactMethod
    fun getDidDocument(walJson: String, didAlias: String, promise: Promise) {
        Log.d("PRISM_TAG","Publishing "+didAlias+" w/ wallet "+walJson);
        thread(start = true) {
            try {
                var cliWal = Json.decodeFromString<Wallet>(walJson);
                var didDocJson = getDidDocumentJson(cliWal, didAlias);
                Log.d("PRISM_TAG","Got did document "+didAlias+" w/ doc"+didDocJson)
                promise.resolve(didDocJson);
            } catch (e: Exception) {
                promise.reject("Publish Error", e);
            }
        }
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
    fun importCred(walJson: String, credAlias: String, credJson: String, promise: Promise) {
        Log.d("PRISM_TAG","Importing credential for "+credAlias+" from wallet "+walJson);
        thread(start = true) {
            try {
                val importedCredential = ImportedCredential(
                    credAlias,
                    Json.decodeFromString<VerifiedCredential>(credJson)
                )
                var newWal = Json.decodeFromString<Wallet>(walJson);
                newWal.importedCredentials.add(importedCredential)
                //Log.d("PRISM_TAG","Credential imported",walJson)
                promise.resolve(Json.encodeToString(newWal));
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
                promise.reject("Issue Credential Error", e);
            }
        }
    }

    @ReactMethod
    fun revokeCred(walJson: String, credAlias: String, promise: Promise) {
        Log.d("PRISM_TAG","Revoking credential "+credAlias+" from wallet "+walJson);
        thread(start = true) {
            try {
                var cliWal = Json.decodeFromString<Wallet>(walJson);
                cliWal = revokeCredential(cliWal, credAlias)
                var newWalJson = Json.encodeToString(cliWal)
                Log.d("PRISM_TAG","Credential revoked"+credAlias+" from wallet "+newWalJson)
                promise.resolve(newWalJson);
            } catch (e: Exception) {
                promise.reject("Revoke Credential Error", e);
            }
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun setNetwork(host: String = "ppp.atalaprism.io", port: String = "50053") {
        Log.d("PRISM_TAG","Setting GrpcConfig host "+host+" w/port "+port);
        GrpcConfig.host = host
        GrpcConfig.port = port
    }

    @ReactMethod
    fun verifyCred(walJson: String, credAlias: String, imported: Boolean, promise: Promise) {
        Log.d("PRISM_TAG","Verifying credential for "+credAlias+" from wallet "+walJson);
        thread(start = true) {
            try {
                var cliWal = Json.decodeFromString<Wallet>(walJson);
                var verResult = ""
                if(imported) {
                    verResult = Json.encodeToString(verifyImportedCredential(cliWal, credAlias))
                } else {
                    verResult = Json.encodeToString(verifyIssuedCredential(cliWal, credAlias))
                }
                Log.d("PRISM_TAG","Credential "+credAlias+" is " + verResult)
                promise.resolve(verResult);
            } catch (e: Exception) {
                promise.reject("Publish Error", e);
            }
        }
    }
}