import {PrismModule} from "../prism";
import {logger} from "../logging";
import * as store from "../store";
import * as models from "../models";

const WALLET_NAME_STORAGE_KEY = "primaryRootsWalletNameKey"
let walletName: string = "";

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

export function getWalletJson(walName = getWalletName()) {
    return store.getWallet(walName)
}

export function getWalletName(): string {
    if(!walletName || walletName.length <= 0) {
        const name = store.getItem(WALLET_NAME_STORAGE_KEY)
        if(name) {
            walletName = JSON.parse(name)
        }
    }
    if(walletName) {
        console.log("wallet - Got wallet name",walletName)
        return walletName
    } else {
        throw Error("Wallet name not found in storage")
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

export async function hasWallet(walName = getWalletName()) {
    const found = await store.hasWallet(walName)
    if (found) {
        logger("roots - Has wallet", store.getWallet(walName));
        return true;
    } else {
        logger("roots - Does not have wallet", walName);
        return false;
    }
}

export async function setWalletName(walName: string): Promise<boolean> {
    if(walName && walName.length > 0) {
        const success = await store.updateItem(WALLET_NAME_STORAGE_KEY,JSON.stringify(walName))
        if(success) {
            walletName = walName
            console.log("wallet - Set wallet name",walletName)
            return true
        }
    }
    console.error("wallet - Could not set wallet name",walName)
    return false
}

export async function updateWallet(walName = getWalletName(), walPass: string, walJson: string) {
    if (await store.saveWallet(walName, walPass, walJson)) {
        console.log("roots - updated roots wallet", walJson);
        return true;
    } else {
        console.error("roots - failed to update roots wallet", walJson);
        return false;
    }
}
