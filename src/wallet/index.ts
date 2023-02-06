import {PrismModule} from "../prism";
import {logger} from "../logging";
import * as store from "../store";
import * as models from "../models";

const WALLET_NAME_STORAGE_KEY = "primaryRootsWalletStorageNameKey"

export async function createWallet(walName: string, mnemonic: string, walPass: string): Promise<string> {
    const nameSet = await setWalletName(walName)
    if(nameSet) {
        //const prismWal = PrismModule.newWAL(walName, mnemonic, walPass)
        const prismWal = '{"name": "fakeWallet"}'
        logger("wallet - created new wallet, updating stored wallet")
        return await updateWallet(walName, walPass, prismWal)
    }
    return "Cannot create wallet, could not set name " + walName
}

export function getWallet(walName = getWalletName()): models.wallet|undefined{
    if(walName) {
        const walJson = getWalletJson(walName);
        if (walJson) {
            return JSON.parse(walJson);
        } else {
            console.log("Wallet not found", walName)
        }
    } else {
        console.error("Wal name was undefined",walName)
    }
}

export function getWalletJson(walName = getWalletName()): string|undefined {
    if(walName) return store.getWallet(walName)
}

export function getWalletName(): string | undefined {
    let walName = store.getItem(WALLET_NAME_STORAGE_KEY)
    if(walName) {
        return JSON.parse(walName)
    } else {
        return;
    }
}

export async function loadWallet(walName = getWalletName(), walPass: string): Promise<boolean> {
    logger("roots - loading wallet", walName, "with walPass", walPass);
    const restored = await store.restoreWallet(walPass);
    //retrieving wallet pulls the object into memory here
    const rootsWalJson = getWalletJson(walName)
    if (restored && rootsWalJson) {
        logger("roots - loaded wallet", walName, "with walPass", walPass);
        return true
    } else {
        console.error("could not load wallet with walPass", walPass)
        return false
    }
}

export async function loadWalletName(): Promise<boolean> {
    logger("wallet - loading wallet name");
    const restored = await store.restoreItems([WALLET_NAME_STORAGE_KEY]);
    //retrieving wallet pulls the object into memory here
    const rootsWalName = getWalletName()
    if (restored && rootsWalName) {
        logger("wallet - loaded wallet name",rootsWalName);
        return true
    } else {
        console.error("wallet - could not load wallet name")
        return false
    }
}

export async function hasWallet(walName = getWalletName()) {
    if (!walName) return false;

    const found = await store.hasWallet(walName)
    if (found) {
        logger("wallet - Has wallet", store.getWallet(walName));
        return true;
    } else {
        logger("wallet - Does not have wallet", walName);
        return false;
    }
}

export async function setWalletName(walName: string): Promise<boolean> {
    if(walName && walName.length > 0) {
        const success = await store.updateItem(WALLET_NAME_STORAGE_KEY,JSON.stringify(walName))
        if(success) {
            console.log("wallet - Set wallet name",getWalletName())
            return true
        } else {
            console.error("wallet - Storing new wallet name failed",walName)
        }
    }
    console.error("wallet - Could not set wallet name",walName)
    return false
}

export async function updateWallet(
    walName = getWalletName(), walPass: string, walJson: string): Promise<string>{
    return (walName) ? await store.saveWallet(walName, walPass, walJson) : "Could not update wallet, walName undefined";
}
