import {PrismModule} from "../prism";
import {logger} from "../logging";
import * as store from "../store";
import * as models from "../models";

const WALLET_NAME_STORAGE_KEY = "primaryRootsWalletNameKey"

export async function createWallet(walName: string, mnemonic: string, walPass: string): Promise<boolean> {
    const nameSet = await setWalletName(walName)
    if(nameSet) {
        const prismWal = PrismModule.newWal(walName, mnemonic, walPass)
        logger("wallet - created new wallet, updating stored wallet")
        const result = await updateWallet(walName, walPass, prismWal)
        if (result) {
            logger('Wallet created', getWalletJson(walName))
            return result;
        } else {
            logger('Could not create wallet', walName, walPass)
        }
    }
    return false
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

export async function updateWallet(walName = getWalletName(), walPass: string, walJson: string) {
    if(!walName) return false;

    if (await store.saveWallet(walName, walPass, walJson)) {
        console.log("wallet - updated roots wallet", walJson);
        return true;
    } else {
        console.error("wallet - failed to update roots wallet", walJson);
        return false;
    }
}
