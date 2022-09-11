package com.rootswallet

import android.content.res.Resources.NotFoundException
import com.rootsid.wal.library.dlt.model.Did
import com.rootsid.wal.library.mongoimpl.document.WalletDocument
import com.rootsid.wal.library.wallet.model.Wallet
import com.rootsid.wal.library.wallet.storage.WalletStorage
import java.util.*

class InMemoryWalletStorage(): WalletStorage {

    private lateinit var wallet: Wallet

    init {
//        this.wallet = wal
    }

    override fun createWalletObject(walletId: String, seed: String): Wallet = WalletDocument(walletId, seed)

    override fun exists(walletId: String): Boolean {
        return wallet._id.equals(walletId)
    }

    override fun findById(walletId: String): Wallet {
        return if(exists(walletId))
            wallet
        else
            throw NotFoundException("wallet id not found $walletId")
    }

    override fun findDidByAlias(walletId: String, alias: String): Optional<Did> {
        return if(exists(walletId))
            Optional.ofNullable(wallet.dids.find { it.alias.equals(alias,false)  })
        else
            throw NotFoundException("wallet id not found $walletId")
    }

    override fun insert(wallet: Wallet): Wallet {
        this.wallet = wallet
        return wallet
    }

    override fun list(): List<Wallet> {
        return listOf(this.wallet)
    }

    override fun listDids(walletId: String): List<Did> {
        return if(exists(walletId))
            wallet.dids
        else
            throw NotFoundException("wallet id not found $walletId")
    }

    override fun update(wallet: Wallet): Boolean {
        this.wallet = wallet
        return true
    }
}
