import { logger, warn } from '../logging'

let cachedItems: {[alias: string]: string } = {};
let cachedWallets: { [walName: string]: string } = {};

export function getItem(alias: string) {
    const itemJson = cachedItems[alias]
    logger("CachedStore - get",alias,"in cache is",itemJson)
    return itemJson;
}

export function getItems(regex: RegExp) {
    const keys = Object.keys(cachedItems).filter((key) => regex.test(key))
    logger("CachedStore - getting items",keys,"w/regex",regex)
    let items = []
    if(!keys || keys == null || keys.length <= 0) {
        logger("CachedStore - No items found w/regex",regex);
        return items;
    } else {
        logger("CachedStore - retrieving # of items",keys.length,"w/regex",regex);
        items = keys.map(key => getItem(key))
        logger("CachedStore - retrieved # of items",items.length,"w/regex",regex);
        return items;
    }
}

export function getWallet(walName: string) {
    const walJson = cachedWallets[walName]
    logger("CachedStore - ",walName,"in cache is",walJson)
    return walJson;
}

export function hasItem(alias: string) {
    const item = getItem(alias)
    const noItem = (!item || item == null);
    if(noItem) {
        logger("CachedStore - does not have item",alias)
        return false
    } else {
        logger("CachedStore - has item",alias,item)
        return true
    }
}

export function hasWallet(walName: string) {
    const walJson = getWallet(walName)
    const hasWal = !(!walJson || walJson == null);
    if(hasWal) {
        logger("CachedStore - has wallet",walJson)
    } else {
        logger("CachedStore - no wallet found")
    }
    return hasWal;
}

export async function status() {
    logger("CachedStore - wallets:",Object.keys(cachedWallets))
    logger("CachedStore - items:",Object.keys(cachedItems))
}

export function storeItem(alias: string, item: string) {
    try {
        logger("CachedStore - storing item",alias,":",item)
        const oldItem = cachedItems[alias]
        cachedItems[alias] = item
        if(oldItem && oldItem !== null) {
            logger("CachedStore - Replace previous item",alias,oldItem)
        }
        return true;
    } catch(error) {
        console.error("CachedStore - Could not store item",alias,error)
        return false;
    }
    return false;
}

export function storeWallet(walName: string,walJson: string) {
    try {
        logger("CachedStore - storing wallet",walName,":",walJson)
        const oldWallet = cachedWallets[walName]
        cachedWallets[walName] = walJson
        if(oldWallet && oldWallet !== null) {
          logger("CachedStore - Replace previous wallet",oldWallet)
        }
        return true;
    } catch(error) {
        console.error("CachedStore - Could not store wallet",error)
        return false;
    }
    return false;
}