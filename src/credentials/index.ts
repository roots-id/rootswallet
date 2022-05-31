import { logger } from '../logging'
import * as models from '../models'
import {PrismModule} from "../prism";
import {credential, issuedCredential} from "../models";

export const credLogo = require('../assets/vc.png');

//export const allCredsRegex = new RegExp(models.getStorageKey("",models.ModelType.CREDENTIAL)+'*')

export const refreshTriggers: {(): void}[] = []

export function addRefreshTrigger(trigger: {(): void}) {
    logger("creds - adding refresh trigger")
    refreshTriggers.push(trigger)
}

function atob(data: string) { return new Buffer(data, "base64").toString("binary"); }
function btoa(data: string) { return new Buffer(data, "binary").toString("base64"); }

export function decodeCredential(encodedSignedCredential: string) {
    console.log("creds - decoding cred",encodedSignedCredential)
    const credValues = encodedSignedCredential.toString().split('.')
    credValues.forEach((val)=>console.log("val is",val))
    console.log("creds - decoding cred values",credValues)
    //decode and replace any null characters
    const decoded = atob(credValues[0]).replace("/\0/g", "")
    //const decoded = PrismModule.issueCred(getWalletJson(currentWal._id), didAlias, credJson);cred
    logger("creds - decoded cred value",decoded)
    return decoded
}

// export function getCredentials() {
//     logger("creds - getting cred items")
//     const credItemJsonArray = store.getItems(allCredsRegex)
//     logger("creds - got cred items",String(credItemJsonArray))
//     const creds = credItemJsonArray.map(credItemJson => JSON.parse(credItemJson))
//     return creds;
// }

export function getCredByAlias(credAlias: string,wal: models.wallet) {
    const imported = getImportedCredByAlias(credAlias,wal)
    if(imported) {
        logger("roots - got cred (imported) by hash",credAlias)
        return imported;
    }
    const issued = getIssuedCredByAlias(credAlias,wal)
    if(issued) {
        logger("roots - got cred (issued) by hash",credAlias)
        return issued;
    }

    console.warn("No imported or issued cred hash found",credAlias)
}

export function getCredByHash(credHash: string,wal: models.wallet) {
    const imported = getImportedCredByHash(credHash,wal)
    if(imported) {
        logger("roots - got cred (imported) by hash",credHash)
        return imported;
    }
    const issued = getIssuedCredByHash(credHash,wal)
    if(issued) {
        logger("roots - got cred (issued) by hash",credHash)
        return issued;
    }

    console.warn("No imported or issued cred hash found",credHash)
}

export function getCredDetails(encodedCred: models.vc) {
    console.log("creds - decoding encoded cred",encodedCred)
    const decodedCred = decodeCredential(encodedCred.encodedSignedCredential)
    console.log("creds - decoded cred",decodedCred)
    const credObj = JSON.parse(decodedCred)
    console.log("cred - decoded cred obj has eys",Object.keys(credObj))
    const credHash = encodedCred.proof.hash
    console.log("cred - hash for decoded cred",credHash)
    return {hash: credHash, encoded: encodedCred.encodedSignedCredential, decoded: credObj}
}

export function getImportedCredByAlias(credAlias: string, wal: models.wallet): models.credential|undefined {
    logger("roots - Getting imported credential",credAlias)

    if(wal.importedCredentials) {
        const iCred = wal.importedCredentials.find((cred) => {
            if(cred.alias === credAlias) {
                logger("roots - Found cred alias",credAlias)
                return true
            }
            else {
                logger("roots - cred alias",cred.alias,"does not match",credAlias)
                return false
            }
        })
        if(iCred) {
            logger("roots - got imported cred w/keys",Object.keys(iCred))
            return iCred
        }
    } else {
        logger("roots - No imported credential hash",credAlias)
        return;
    }
}

export function getImportedCredByHash(credHash: string, wal: models.wallet): models.credential|undefined {
    logger("roots - Getting imported credential",credHash)

    if(wal.importedCredentials) {
        const iCred = wal.importedCredentials.find((cred) => {
            const curCredHash = cred.verifiedCredential.proof.hash
            if(curCredHash === credHash) {
                logger("roots - Found cred hash",curCredHash)
                return true
            }
            else {
                logger("roots - cred hash",curCredHash,"does not match",credHash)
                return false
            }
        })
        if(iCred) {
            logger("roots - got imported cred w/keys",Object.keys(iCred))
            return iCred
        }
    } else {
        logger("roots - No imported credential hash",credHash)
        return;
    }
}

export function getIssuedCredByAlias(credAlias: string, wal: models.wallet): models.issuedCredential|undefined {
    logger("roots - Getting imported credential",credAlias)

    if(wal.issuedCredentials) {
        const iCred = wal.issuedCredentials.find((cred) => {
            if(cred.alias === credAlias) {
                logger("roots - Found cred alias",credAlias)
                return true
            }
            else {
                logger("roots - cred alias",cred.alias,"does not match",credAlias)
                return false
            }
        })
        if(iCred) {
            logger("roots - got imported cred w/keys",Object.keys(iCred))
            return iCred
        }
    } else {
        logger("roots - No imported credential alias",credAlias)
        return;
    }
}

export function getIssuedCredByHash(credHash: string, wal: models.wallet): models.issuedCredential|undefined {
    logger("roots - Getting issued credential",credHash)

    if(wal.issuedCredentials) {
        const iCred = wal.issuedCredentials.find((cred) => {
            const curCredHash = cred.verifiedCredential.proof.hash
            if(curCredHash === credHash) {
                logger("roots - Found issued cred hash",curCredHash)
                return true
            }
            else {
                logger("roots - issued cred hash",curCredHash,"does not match",credHash)
                return false
            }
        })
        if(iCred) {
            logger("roots - got issued cred w/keys"+Object.keys(iCred))
            return iCred
        }
    } else {
        logger("roots - No issued credential hash",credHash)
        return;
    }
}

export function getShareableCred(iCred: models.credential) {
    logger("roots - getting shareable cred for cred",JSON.stringify(iCred))
    const shareable = {
        encodedSignedCredential: iCred.verifiedCredential.encodedSignedCredential,
        proof: iCred.verifiedCredential.proof,
    }
    return shareable
}

export function hasNewCreds() {
    logger("creds - triggering cred refresh",refreshTriggers.length)
    refreshTriggers.forEach(trigger=>trigger())
}

function isIssuedCred(cred: credential) {
    if ((cred as issuedCredential).issuingDidAlias) {
        logger("roots - cred is issued cred",JSON.stringify(cred))
        return true
    } else {
        logger("roots - cred is NOT issued cred",JSON.stringify(cred))
        return false
    }
}

export async function issueCredential(didAlias: string, iCred: models.issuedCredential, wal: models.wallet): Promise<models.wallet|undefined> {
    const credJson = JSON.stringify(iCred)
    console.log("roots - issuing credential", didAlias, credJson)
    let result;

    try {
        const newWalJson = await PrismModule.issueCred(JSON.stringify(wal), didAlias, credJson);
        logger("roots - wallet after issuing credential", newWalJson)
        if (newWalJson) {
            return JSON.parse(newWalJson)
        } else {
            console.error("roots - Could not issue credential")
        }
    } catch (error) {
        console.error("Could not issue credential to", didAlias, iCred, error, error.stack)
    }

    return result
}

export async function revokeCredentialByHash(credHash: string, wal: models.wallet): Promise<models.wallet|undefined> {
    logger("Revoking credential", credHash)
    const issuedCred = getIssuedCredByHash(credHash, wal)
    if (issuedCred) {
        return await revokeCredential(issuedCred,wal)
    } else {
        console.error("could not revoke credential by hash", credHash)
        return issuedCred
    }
}

export async function revokeCredential(issuedCred: models.issuedCredential, wal: models.wallet): Promise<models.wallet|undefined> {
    logger("roots - Revoking issued credential w/keys", Object.keys(issuedCred))
    const jsonWallet = JSON.stringify(wal)
    console.log("roots - Revoking issued cred", issuedCred.alias, jsonWallet)
    const newWalJson = await PrismModule.revokeCred(jsonWallet, issuedCred.alias)
    if (newWalJson) {
        return JSON.parse(newWalJson)
    } else {
        console.error("Could not revoke accepted credential", issuedCred.alias)
        return
    }
}

export async function verifyCredentialByHash(credHash: string, wal: models.wallet) {
    logger("Verifying credential",credHash)
    const cred = getCredByHash(credHash, wal)
    if(cred) {
        console.log("roots - Got cred for verification",JSON.stringify(cred));
        const messageArray = await PrismModule.verifyCred(JSON.stringify(wal),cred.alias, !isIssuedCred(cred))
        return messageArray
    } else{
        console.error("could not verify credential by hash, no cred found",credHash)
    }
}