import * as AsyncStore from './AsyncStore'
import * as CachedStore from './CachedStore'
//TODO move this into AsyncStore so they can work together?
import * as SecureStore from 'expo-secure-store';
import { logger } from '../logging'

const quickReplyResults = {}

export async function status() {
    logger("store - Prompting for status messages")
    await AsyncStore.status();
    CachedStore.status();
}

export function getWallet(walName: string) {
    const walJson = CachedStore.getWallet(walName);
    if (!walJson || walJson == null) {
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
        logger("store - Has wallet in cache",getWallet());
        return true;
    }
}

export async function restoreWallet(passphrase: string) {
    try {
        //TODO use keychain for secrets, etc.
        const walName = await SecureStore.getItemAsync(passphrase);
        logger("restoring",walName,"w/passphrase",passphrase)
        if(!walName || walName == null) {
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

export async function saveWallet(walName: string, walPass: string, walJson: string) {
    logger("store - Saving wallet",walName,":",walJson)
    if(walJson && walJson.length > 0) {
        try {
            logger("store - Saving wallet to storage",walName,":",walJson)
            //TODO use keychain to encrypt values
            const result = await storeWallet(walName,walPass,walJson)
            if(result) {
                logger("store - successfully saved wallet",walName,":",result)
                return true;
            } else {
                logger("store - failed to save wallet", walName,":",result)
                return false;
            }
        } catch(error) {
            logger("store - could not save wallet",walName,":",walJson,error)
            return false;
        }
    } else {
        logger("store - Could not save wallet",walName,":",walJson)
        return false;
    }
}

async function storeWallet(walName: string, walPass: string, walJson: string) {
    const errMsgs = [];
    errMsgs.push("store - can't store wallet "+walName);
    errMsgs.push("wallet "+walJson);
    if(walJson) {
        try {
            logger('store - secure storing wallet',walName,"w/ pass",walPass)
            await SecureStore.setItemAsync(walPass,walName);
            if(await AsyncStore.storeWallet(walName,walJson)) {
                CachedStore.storeWallet(walName,walJson)
                logger('store - secure stored wallet')
                return true
            } else {
                logger('store - could not store in async store')
                return false
            }
        } catch(error) {
            errMsgs.push(error.message)
            logger(...errMsgs)
            return false;
        }
    } else {
        logger(...errMsgs)
        return false;
    }
}

export async function hasItem(alias: string) {
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
    const itemJson = CachedStore.getItem(alias);
    if (!itemJson || itemJson == null) {
        logger('store - item not found in cache',alias)
        return;
    } else {
        logger('store - item found in cache',alias,itemJson)
        return itemJson;
    }
}

export function getItems(regex: RegExp) {
    const items = CachedStore.getItems(regex);
    if (!items || items == null || items.length <= 0) {
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
    if(!aliases || aliases == null || aliases.length <= 0) {
        logger("store - No aliases to restore",aliases)
        return true;
    } else {
        try {
            const allRestored = await aliases.reduce(async (previousStatus,alias) => {
                logger("store - restoring",alias)
                const itemJson = await AsyncStore.getItem(alias)
                if(!itemJson || itemJson == null) {
                    logger("store - No item found",alias)
                    previousStatus = previousStatus && false;
                    return previousStatus
                } else {
                    logger("store - putting restored item in cache",alias,":",itemJson)
                    const result = CachedStore.storeItem(alias,itemJson)
                    previousStatus = previousStatus && result;
                    return previousStatus
                }
            },true);
            logger("were all items restored",allRestored)
            return allRestored;
        } catch (error) {
            logger("store - getting items from storage failed",aliases,error)
            return false;
        }
    }
}


export async function saveItem(alias: string, itemJson: string) {
    if(await hasItem(alias)) {
        logger("store - item already exists.  Not adding",alias)
        return false
    } else {
        return updateItem(alias,itemJson);
    }
}

async function storeItem(alias: string, itemJson: string) {
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
        } catch(error) {
            console.error("Error storing item",alias,itemJson,error,error.stack)
            return false;
        }
    } else {
        console.error("store - could not store item json",alias,itemJson)
        return false;
    }
}

export async function updateItem(alias: string, itemJson: string) {
    try {
        await storeItem(alias, itemJson);
        logger("store - item added/updated",alias,"json:",itemJson)
        return true
    } catch(error) {
        console.error("Could not update item",alias,itemJson)
        return false
    }
}

export function getQuickReplyResult(replyId: string) {
    logger("store - Getting quick reply result for id",replyId,"=",quickReplyResults[replyId])
    return quickReplyResults[replyId]
}

export function addQuickReplyResult(replyId: string,result: string) {
    logger("store - Adding quick reply result",replyId,"=",result)
    quickReplyResults[replyId]=result
}