package com.rootswallet

import android.annotation.SuppressLint
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.rootsid.wal.library.*
import com.rootsid.wal.library.dlt.Dlt
import com.rootsid.wal.library.dlt.model.Did
import com.rootsid.wal.library.mongoimpl.WalletDocStorage
import com.rootsid.wal.library.wallet.WalletService
import com.rootsid.wal.library.wallet.model.IssuedCredential
import com.rootsid.wal.library.wallet.model.Wallet
import com.rootsid.wal.library.wallet.model.addDid
import com.rootsid.wal.library.wallet.storage.WalletStorage
//import io.iohk.atala.prism.api.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import java.util.*
import kotlin.concurrent.thread

class PrismModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    //var wal:Wallet = newWallet("wallet1","","passphrase")
    var dlt: Dlt = Dlt()
    var walStore = InMemoryWalletStorage();
    var walSer: WalletService = WalletService(walStore,dlt)

    override fun getName(): String {
        return "PrismModule"
    }

    @ReactMethod
    fun getDidDocument(did: String, promise: Promise) {
        Log.d("PRISM_TAG","Getting DID doc"+did);
        thread(start = true) {
            try {
                var didDocJson = dlt.getDidDocumentJson(did);
                Log.d("PRISM_TAG","Got did document "+did+" w/ doc"+didDocJson)
                promise.resolve(didDocJson);
            } catch (e: Exception) {
                promise.reject("Publish Error", e);
            }
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun newDID(walJson: String, didAlias: String): String {
        var cliWal = Json.decodeFromString<Wallet>(walJson);
        cliWal.addDid(dlt.newDid(didAlias,0,));
        return Json.encodeToString(cliWal)
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun newWal(name: String, mnemonic: String, passphrase: String): String {
        val cliWal = walSer.createWallet(name,mnemonic,passphrase);
        return Json.encodeToString<Wallet>(cliWal);
    }

    @ReactMethod
    fun publishDid(walId: String, didAlias: String, seed:ByteArray, promise: Promise) {
        Log.d("PRISM_TAG","Publishing "+didAlias);
        thread(start = true) {
            try {
                var didUpdate = dlt.publishDid(walStore.findDidByAlias(walId,didAlias).get(),seed);
                Log.d("PRISM_TAG","Published $didAlias from with opId ${didUpdate.operationId}")
                promise.resolve(didUpdate.operationId)
            } catch (e: Exception) {
                promise.reject("Publish Error", e);
            }
        }
    }

    @ReactMethod
    fun issueCred(issuerDidJson: String, seed: ByteArray, credJson: String, promise: Promise) {
        Log.d("PRISM_TAG","Issuing credential for $issuerDidJson");
        thread(start = true) {
            try {
                //var cliWal = Json.decodeFromString<Wallet>(walJson);
                val cliCred = Json.decodeFromString<IssuedCredential>(credJson);
                val issuerDid = Json.decodeFromString<Did>(issuerDidJson);
                val dltUpdate = dlt.issueCredential(issuerDid, seed, cliCred)
                Log.d("PRISM_TAG","Credential $cliCred.verifiedCredential for did $issuerDidJson from wallet $credJson")
                promise.resolve(dltUpdate.operationId);
            } catch (e: Exception) {
                promise.reject("Issue Credential Error", e);
            }
        }
    }

    @ReactMethod
    fun revokeCred(credJson: String, issuerDidJson: String, seed: ByteArray, promise: Promise) {
        Log.d("PRISM_TAG","Revoking credential $credJson from issuerDid $issuerDidJson");
        thread(start = true) {
            try {
                var issuerCred = Json.decodeFromString<IssuedCredential>(credJson);
                var issuerDid = Json.decodeFromString<Did>(issuerDidJson)
                var revUpdate = dlt.revokeCredential(issuerCred,issuerDid,seed)
                Log.d("PRISM_TAG","Credential revoked $credJson for issuer $issuerDidJson")
                promise.resolve(revUpdate.operationId);
            } catch (e: Exception) {
                promise.reject("Revoke Credential Error", e);
            }
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun setNetwork(host: String = "ppp.atalaprism.io", port: String = "50053") {
        Log.d("PRISM_TAG","Setting GrpcConfig host "+host+" w/port "+port);
        Dlt.GrpcConfig.host = host
        Dlt.GrpcConfig.port = port
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
