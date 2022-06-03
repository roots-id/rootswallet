import {PrismModule} from "../prism";
import {logger} from "../logging";
import * as store from "../store";
import * as models from "../models";

let currentWal: models.wallet;

export async function createWallet(walName: string, mnemonic: string[], walPass: string) {
    const prismWal = PrismModule.newWal(walName, mnemonic, walPass)
    const result = await updateWallet(walName, walPass, prismWal)
    if (result) {
        logger('Wallet created', getWalletJson(currentWal._id))
        return result;
    } else {
        logger('Could not create wallet', walName, walPass)
        return result;
    }
}

export function getWallet() {
    return currentWal;
}

export async function loadWallet(walName: string, walPass: string): Promise<boolean> {
    logger("roots - loading wallet", walName, "with walPass", walPass);
    const restored = await store.restoreWallet(walPass);
    //retrieving wallet pulls the object into memory here
    const rootsWal = getRootsWallet(walName)
    if (restored && !(!rootsWal || rootsWal == null)) {
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

export function getRootsWallet(walName: string) {
    if (!currentWal || currentWal == null) {
        logger("roots - rootsWallet not set yet");
        const storedWalJson = store.getWallet(walName);
        if (!storedWalJson || storedWalJson == null) {
            logger("roots - no rootsWallet in storage", storedWalJson);
            return currentWal;
        } else {
            logger("roots - rootsWallet from storage", storedWalJson);
            currentWal = JSON.parse(storedWalJson);
            return currentWal;
        }
    } else {
        logger("roots - getRootsWallet has wallet", currentWal);
        return currentWal;
    }
}

export function getWalletJson(walId: string) {
    return store.getWallet(walId)
}

export async function updateWallet(walName: string, walPass: string, walJson: string) {
    if (await store.saveWallet(walName, walPass, walJson)) {
        currentWal = JSON.parse(walJson)
        logger("roots - updated roots wallet", walJson);
        return true;
    } else {
        console.error("roots - failed to update roots wallet", walJson);
        return false;
    }
}