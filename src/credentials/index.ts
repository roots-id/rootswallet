import * as models from '../models'
import { logger } from '../logging'
import base64 from 'react-native-base64'
import * as store from '../store'

import credentialLogo from '../assets/vc.png';
export const credLogo = credentialLogo;

export const allCredsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_CRED)+'*')

export const refreshTriggers = []

export function addRefreshTrigger(trigger) {
    logger("creds - adding refresh trigger")
    refreshTriggers.push(trigger)
}

export function decodeCredential(encodedSignedCredential: object) {
    console.log("creds - decoding cred",encodedSignedCredential)
    const credValues = encodedSignedCredential.toString().split('.')
    credValues.forEach((val)=>console.log("val is",val))
    console.log("creds - decoding cred values",credValues)
    //decode and replace any null characters
    const decoded = base64.decode(credValues[0]).replace(/\0/g, '')
    //const decoded = PrismModule.issueCred(getWalletJson(currentWal._id), didAlias, credJson);cred
    logger("creds - decoded cred value",decoded)
    return decoded
}

export function hasNewCreds() {
    logger("creds - triggering cred refresh",refreshTriggers.length)
    refreshTriggers.forEach(trigger=>trigger())
}

export function getCredentials() {
    logger("creds - getting cred items")
    const credItemJsonArray = store.getItems(allCredsRegex)
    logger("creds - got cred items",String(credItemJsonArray))
    const creds = credItemJsonArray.map(credItemJson => JSON.parse(credItemJson))
    return creds;
}

export function getCredDetails(encodedCred: object) {
    console.log("creds - decoding encoded cred",encodedCred)
    const decodedCred = decodeCredential(encodedCred.encodedSignedCredential)
    console.log("creds - decoded cred",decodedCred)
    const credObj = JSON.parse(decodedCred)
    console.log("cred - decoded cred obj has eys",Object.keys(credObj))
    const credHash = encodedCred.proof.hash
    console.log("cred - hash for decoded cred",credHash)
    return {hash: credHash, encoded: encodedCred.encodedSignedCredential, decoded: credObj}
}

export function getCredItem(credHash: string) {
    logger("creds - Getting cred",credHash)
    if(credHash) {
        const credItemJson = store.getItem(models.getStorageKey(credHash,models.MODEL_TYPE_CRED));
        logger("creds - Got cred json",credItemJson)
        if(credItemJson) {
            const credItem = JSON.parse(credItemJson)
            logger("creds - cred w/keys",Object.keys(credItem))
            return credItem
        } else {
            logger("creds - cred not found",credHash)
            return;
        }
    } else {
        logger("creds - can't get cred for undefined credHash",credHash)
    }
}

export function getShareableCred(hash: string) {
    logger("roots - getting shareable cred by alias",hash)
    const cred = getCredItem(hash)
    const shareable = {
        encodedSignedCredential: cred.encodedSignedCredential,
        proof: cred.proof,
    }
    return shareable
}

export function showCred(navigation,cred) {
    console.log("cred - show cred",cred)
    navigation.navigate('Credential Details',{cred: getShareableCred(cred)})
}