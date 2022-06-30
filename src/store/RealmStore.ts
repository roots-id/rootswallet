//import {createRealmContext} from '@realm/react';
//export const WalletRealmContext = createRealmContext({
//  schema: [Wallet],
//});

import Realm from "realm";
import { WALLET_SCHEMA } from "./Schemas"

const config = {
    inMemory: true,
    schema: [WALLET_SCHEMA],
    schemaVersion: 4,
}

//export async function initRealm() {
//    try {
//        realm = await Realm.open(config);
//        realm.close();
//    } catch(error) {
//        console.error("Failed to open the realm",error.message)
//    }
//}

export async function storeRealmWallet(wal) {
    try {
        console.log('RealmWallet - start storing realm wallet',wal._id)
        let realmWal;
        realm = await Realm.open(config);
        console.log("opened realm",realm);
        realm.write(() => {
            realmWal = realm.create(WALLET_SCHEMA.name,wal,'never');
        })
        console.log("RealmWallet - result of write",JSON.stringify(realmWal))
        const result = realm.objectForPrimaryKey(WALLET_SCHEMA.name,wal._id)
        console.log('RealmWallet - finished storing wallet in realm',JSON.stringify(result))
        realm.close();
        return (result._id && !result._id == null);
    } catch(error) {
        console.error("Could not store realm,",error)
    }
    return false
}

export async function getRealmWallet(walName,password) {
    console.log('RealmWallet - getting realm wallet')
    let realmWal;
    realm = await Realm.open(config);
    const wallets = realm.objects(WALLET_SCHEMA.name);
    console.log("RealmWallet - The list of realm wallets are:",wallets.map((wallet) => wallet._id));
    // filter for all tasks with a status of "Open"
    const namedWallets = wallets.filtered("_id = "+walName);
    if(namedWallets && namedWallets.length>0) {
        return namedWallets[0]
    } else {
        console.log("RealmWallet - Could not get named wallet:",walName)
    }
    realm.close();

}