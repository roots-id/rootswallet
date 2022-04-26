import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../logging'

export async function getItem(key: string) {
  try {
    const item = await AsyncStorage.getItem(key)
    if(!item || item == null) {
        logger("AsyncStore - no item found for name",key)
        return null;
    } else {
        logger("AsyncStore - item found",key)
        return item
    }
  } catch(e) {
    console.error("AsyncStore - Could not get async item",key,error)
    return null;
  }
  return null;
}

export async function getStoredKeys(regex: RegExp) {
    const keys = await AsyncStorage.getAllKeys()
    const filteredKeys = keys.filter((key) => regex.test(key))
    logger("AsyncStore - getting stored keys",filteredKeys,"w/regex",regex)
    if(!filteredKeys || filteredKeys == null || filteredKeys.length <= 0) {
        logger("AsyncStore - No keys found w/regex",regex);
        return filteredKeys;
    } else {
        logger("AsyncStore - retrieved # of keys",filteredKeys.length,"w/regex",regex);
        return filteredKeys;
    }
}

export async function getWallet(walName: string) {
  try {
    const walJson = await AsyncStorage.getItem(walName)
    if(!walJson || walJson == null) {
        logger("AsyncStore - no wallet found for name",walName)
        return null;
    } else {
        logger("AsyncStore - wallet found",walName)
        return walJson
    }
  } catch(e) {
    console.error("AsyncStore - Could not get async wallet,",error)
    return null;
  }
  return null;
}

export async function hasItem(alias: string) {
    const item = await getItem(alias)
    const hasItem = !(!item || item == null);
    if(hasItem) {
        logger("AsyncStore - has item",alias,item)
    } else {
        logger("AsyncStore - no item found",alias)
    }
    return hasItem;
}

export async function hasWallet(walName: string) {
    const walJson = await getWallet(walName)
    const hasWal = !(!walJson || walJson == null);
    if(hasWal) {
        logger("AsyncStore - has wallet",walJson)
        return true;
    } else {
        logger("AsyncStore - no wallet found")
        return false;
    }
}

export async function status() {
  let keys = []
  try {
    keys = await AsyncStorage.getAllKeys()
  } catch(e) {
    console.error("AsyncStore - Could not get async store status,",error)
  }

  logger("AsyncStore - keys:",keys)
}

export async function storeItem(alias: string, item: string) {
    try {
        logger('AsyncStore - start storing item',alias)
        const oldItem = await AsyncStorage.setItem(alias, item)
        if(oldItem && oldItem !== null) {
          logger("AsyncStore - Replace previous item",alias,oldItem)
        }
        return true;
    } catch(error) {
        console.error("AsyncStore - Could not store async item",alias,error)
        return false;
    }
    return false;
}

export async function storeWallet(walName: string,walJson: string) {
    try {
        logger('AsyncStore - start storing wallet',walName)
        const oldWallet = await AsyncStorage.setItem(walName, walJson)
        if(oldWallet && oldWallet !== null) {
          logger("AsyncStore - Replace previous wallet",oldWallet)
        }
        return true;
    } catch(error) {
        console.error("AsyncStore - Could not store async wallet,",error)
        return false;
    }
    return false;
}