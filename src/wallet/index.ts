import {PrismModule} from "../prism";
import {logger} from "../logging";
import * as store from "../store";
import * as models from "../models";

export async function createWallet(walName: string, mnemonic: string, walPass: string) {
    const prismWal = PrismModule.newWal(walName, mnemonic, walPass)
    const result = await updateWallet(walName, walPass, prismWal)
    if (result) {
        logger('Wallet created', getWalletJson(walName))
        return result;
    } else {
        logger('Could not create wallet', walName, walPass)
        return result;
    }
}

export function getWallet(walName: string): models.wallet|undefined{
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

export async function loadWallet(walName: string, walPass: string): Promise<boolean> {
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

export async function hasWallet(walName: string) {
    if (await store.hasWallet(walName)) {
        logger("roots - Has wallet", store.getWallet(walName));
        return true;
    } else {
        logger("roots - Does not have wallet", walName);
        return false;
    }
}

export function getWalletJson(walId: string) {
    return store.getWallet(walId)
}

export async function updateWallet(walName: string, walPass: string, walJson: string) {
    if (await store.saveWallet(walName, walPass, walJson)) {
        console.log("roots - updated roots wallet", walJson);
        return true;
    } else {
        console.error("roots - failed to update roots wallet", walJson);
        return false;
    }
}