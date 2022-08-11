import * as AsyncStore from './AsyncStore'
import * as CachedStore from './CachedStore'
import * as SecureStore from 'expo-secure-store';

import {logger} from '../logging'
import {getJsonFromMap, getMapFromJson, replaceSpecial} from '../utils'
import {loadStorage} from "./AsyncStore";

export const WALLET_LOGIN_SUCCESS = "rootsWalletLoginSuccessful"

export async function clearStorage() : Promise<void>{
    logger("store - Clearing storage")
    try {
        CachedStore.clear()
        await AsyncStore.clear()
    } catch(error: any) {
        console.error("Failed to clear storage",error,error.stack)
    }
}

export async function exportStorage() : Promise<string|undefined>{
    logger("store - exporting storage")
    try {
        const asyncStoreExport: Map<string,string> = await AsyncStore.exportStorage()
        const storeExportJson = getJsonFromMap(asyncStoreExport)
        logger("store - exported storage:",storeExportJson)
        return storeExportJson
    } catch(error: any) {
        console.error("Failed to export storage",error,error.stack)
    }
    return undefined
}

export async function importStorage(importJson: string) : Promise<string[]|undefined>{
    logger("store - loading storage",importJson)
    try {
        const storeImportMap = getMapFromJson(importJson)
        const result: string[] = await AsyncStore.loadStorage(storeImportMap)
        return result
    } catch(error: any) {
        console.error("Failed to export storage",error,error.stack)
    }
    return undefined
}

export async function status() {
    logger("store - Prompting for status messages")
    await AsyncStore.status();
    CachedStore.status();
}

export function getWallet(walName: string) {
    const walJson = CachedStore.getWallet(walName);
    if (!walJson) {
        logger('store - no cached wallet found')
        return;
    } else {
        logger('store - cached wallet found',walJson)
        return walJson;
    }
}

export async function hasWallet(walName: string) {
    if(!CachedStore.hasWallet(walName)) {
        const hasWallet = await AsyncStore.hasWallet(walName)
        if(hasWallet) {
            logger("store - Has wallet in store",walName);
            return true;
        } else {
            logger("store - Does not have wallet",walName);
            return false;
        }
    }
    else{
        logger("store - Has wallet in cache",getWallet(walName));
        return true;
    }
}

export async function restoreWallet(passphrase: string) {
    try {
        //TODO use keychain for secrets, etc.
        const walName = await SecureStore.getItemAsync(passphrase);
        logger("restoring",walName,"w/passphrase",passphrase)
        if(!walName) {
            logger("store - cannot restore wallet w/passphrase", passphrase)
            return false;
        }else {
            const walJson = await AsyncStore.getWallet(walName)
            if(walJson) {
                logger("store - putting restored wallet in cache",walName,":",walJson)
                CachedStore.storeWallet(walName,walJson)
                return true;
            } else {
                logger("store - No wallet found for walName", walName)
                return false;
            }
        }
    } catch (error) {
        logger("store - getting wallet from secure store failed",error)
        return false
    }
}

export async function saveWallet(walName: string, walPass: string, walJson: string): Promise<string> {
    logger("store - Saving wallet",walName,":",walJson)
    const errMsg = "store - could not save wallet "+ walName+": "+walJson
    if(walJson && walJson.length > 0) {
        try {
            logger("store - Saving wallet to storage",walName,":",walJson)
            //TODO use keychain to encrypt values
            return await storeWallet(walName, walPass, walJson)
        } catch(error) {
            logger(errMsg,error)
            return errMsg+" "+error;
        }
    } else {
        logger(errMsg)
        return errMsg;
    }
}

async function storeWallet(walName: string, walPass: string, walJson: string): Promise<string> {
    const errMsgs = [];
    errMsgs.push("store - can't store wallet "+walName);
    errMsgs.push("wallet "+walJson);
    if(walJson) {
        try {
            logger('store - secure storing wallet',walName,"w/ pass",walPass)
            //TODO make wallet pass and storage actually secure
            await SecureStore.setItemAsync(walPass,walName);
            const asyncStored = await AsyncStore.storeItem(walName,walJson,true)
            if(asyncStored) {
                CachedStore.storeWallet(walName,walJson)
                logger('store - secure stored wallet')
                return WALLET_LOGIN_SUCCESS
            } else {
                errMsgs.push("AsyncStore could not save wallet")
                logger(...errMsgs)
                return "Could not store wallet in AsyncStore";
            }
        } catch(error: any) {
            errMsgs.push(error.message)
            logger(...errMsgs)
            return "Error while storing wallet " + error.message;
        }
    } else {
        logger(...errMsgs)
        return "Could not save wallet, no data found";
    }
}

export async function hasItem(alias: string) {
    alias = replaceSpecial(alias)
    if(!CachedStore.hasItem(alias)) {
        const persisted = await AsyncStore.hasItem(alias)
        if(persisted) {
            logger("store - has item",alias);
            return true;
        } else {
            logger("store - does not have item",alias);
            return false;
        }
    }
    else{
        logger("store - has item in cache",getItem(alias));
        return true;
    }
}

export function getItem(alias: string) {
    alias = replaceSpecial(alias)
    const itemJson = CachedStore.getItem(alias);
    if (!itemJson) {
        logger('store - item not found in cache',alias)
        return;
    } else {
        logger('store - item found in cache',alias,itemJson)
        return itemJson;
    }
}

export function getItems(regex: RegExp) {
    const items = CachedStore.getItems(regex);
    if (!items || items.length <= 0) {
        logger('store - no cached items found')
        return items;
    } else {
        logger('store - cached items found',items.length)
        items.forEach(item => logger("item",item))
        return items;
    }
}

export async function restoreByRegex(regex: RegExp) {
    logger("store - restoring keys by regex",regex)
    const keys = await AsyncStore.getStoredKeys(regex)
    if(keys) {
        logger("store - restored keys by regex",regex,":\n",keys)
        return await restoreItems(keys)
    }else {
        logger("store - no keys restored by regex",regex,":\n",keys)
        return;
    }
}

export async function restoreItems(aliases: string[]) {
    if(!aliases || aliases.length <= 0) {
        logger("store - No aliases to restore",aliases)
        return true;
    } else {
        try {
            for (let alias of aliases) {
                logger("store - restoring", alias);
                alias = replaceSpecial(alias);
                const itemJson = await AsyncStore.getItem(alias);
                if (!itemJson) {
                    console.error("store - Could not restore, no item found", alias);
                } else {
                    logger("store - putting restored item in cache", alias, ":", itemJson);
                    CachedStore.storeItem(alias, itemJson);
                }
            }
            return true;
        } catch (error) {
            logger("store - getting items from storage failed",aliases,error)
            return false;
        }
    }
}


export async function saveItem(alias: string, itemJson: string) {
    alias = replaceSpecial(alias)
    if(await hasItem(alias)) {
        logger("store - item already exists.  Not adding",alias)
        return false
    } else {
        return updateItem(alias,itemJson);
    }
}

async function storeItem(alias: string, itemJson: string) {
    alias = replaceSpecial(alias)
    if(itemJson) {
        try {
            if(await AsyncStore.storeItem(alias, itemJson)) {
                CachedStore.storeItem(alias, itemJson)
                logger('store - stored item',alias,itemJson)
                return true
            } else {
                console.error('store - could not store in async store',alias,itemJson)
                return false
            }
        } catch(error: any) {
            console.error("Error storing item",alias,itemJson,error,error.stack)
            return false;
        }
    } else {
        console.error("store - could not store item json",alias,itemJson)
        return false;
    }
}

export async function updateItem(alias: string, itemJson: string) {
    alias = replaceSpecial(alias)
    try {
        await storeItem(alias, itemJson);
        logger("store - item added/updated",alias,"json:",itemJson)
        return true
    } catch(error) {
        console.error("Could not update item",alias,itemJson)
        return false
    }
}
