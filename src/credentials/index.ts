import {Buffer} from "buffer";
import {logger} from '../logging'
import * as models from '../models'
import {PrismModule} from "../prism";
import {credential, issuedCredential} from "../models";
import {updateWallet} from "../wallet";

export const credLogo = require('../assets/vc.png');
export const issuedCredLogo = require('../assets/issuedVc.png');

export const refreshTriggers: { (): void }[] = []

export async function addImportedCredential(iCred: models.credential, wal: models.wallet): Promise<boolean | undefined> {

    const credHash = iCred.verifiedCredential.proof.hash
    const alreadyExists = getImportedCredByHash(credHash, wal)
    if (!alreadyExists) {
        logger("creds - adding imported credential", credHash, JSON.stringify(iCred))
        const importedCred = {
            alias: iCred.alias,
            verifiedCredential: iCred.verifiedCredential,
        }
        if (!wal.importedCredentials) {
            wal.importedCredentials = []
        }
        wal.importedCredentials.push(importedCred)
        const newWalJson = JSON.stringify(wal)
        logger("creds -  imported credential into wallet", newWalJson)
        const savedWal = await updateWallet(wal._id, wal.passphrase, newWalJson)
        if (savedWal) {
            logger("creds - imported credential", credHash)
        } else {
            console.error("Could not import credential, unable to save wallet", credHash)
        }
        hasNewCred()
        return true
    } else {
        logger("creds - Credential alias already in use", credHash)
    }
}

export function addRefreshTrigger(trigger: { (): void }) {
    logger("creds - adding refresh trigger")
    refreshTriggers.push(trigger)
}

function atob(data: string) {
    return Buffer.from(data, "base64").toString("binary");
}

function btoa(data: string) {
    return Buffer.from(data, "binary").toString("base64");
}

export function decodeCredential(encodedSignedCredential: string): models.decodedSignedCredential {
    console.log("creds - decoding cred", encodedSignedCredential)
    const credValues = encodedSignedCredential.toString().split('.')
    credValues.forEach((val) => console.log("val is", val))
    console.log("creds - decoding cred values", credValues)
    //decode and replace any null characters
    const decoded = atob(credValues[0]).replace("/\0/g", "")
    //const decoded = PrismModule.issueCred(getWalletJson(currentWal._id), didAlias, credJson);cred
    logger("creds - decoded cred value", decoded)
    const decodedObj = JSON.parse(decoded)
    return decodedObj
}

export function encodeCredential(cred: models.decodedSignedCredential): string {
    const credJson = JSON.stringify(cred)
    console.log("creds - encoding cred", credJson)
    const encoded = btoa(credJson)
    logger("creds - encoded cred", encoded)
    return encoded;
}

// export function getCredentials() {
//     logger("creds - getting cred items")
//     const credItemJsonArray = store.getItems(allCredsRegex)
//     logger("creds - got cred items",String(credItemJsonArray))
//     const creds = credItemJsonArray.map(credItemJson => JSON.parse(credItemJson))
//     return creds;
// }

export function getCredByAlias(credAlias: string, wal: models.wallet) {
    const imported = getImportedCredByAlias(credAlias, wal)
    if (imported) {
        logger("creds - got cred (imported) by hash", credAlias)
        return imported;
    }
    const issued = getIssuedCredByAlias(credAlias, wal)
    if (issued) {
        logger("creds - got cred (issued) by hash", credAlias)
        return issued;
    }

    console.warn("No imported or issued cred hash found", credAlias)
}

export function getCredByHash(credHash: string, wal: models.wallet) {
    const imported = getImportedCredByHash(credHash, wal)
    if (imported) {
        logger("creds - got cred (imported) by hash", credHash)
        return imported;
    }
    const issued = getIssuedCredByHash(credHash, wal)
    if (issued) {
        logger("creds - got cred (issued) by hash", credHash)
        return issued;
    }

    console.warn("No imported or issued cred hash found", credHash)
}

export function getImportedCredByAlias(credAlias: string, wal: models.wallet): models.credential | undefined {
    logger("creds - Getting imported credential", credAlias)

    if (wal.importedCredentials) {
        const iCred = wal.importedCredentials.find((cred) => {
            if (cred.alias === credAlias) {
                logger("creds - Found cred alias", credAlias)
                return true
            } else {
                logger("creds - cred alias", cred.alias, "does not match", credAlias)
                return false
            }
        })
        if (iCred) {
            logger("creds - got imported cred w/keys", Object.keys(iCred))
            return iCred
        }
    } else {
        logger("creds - No imported credential hash", credAlias)
        return;
    }
}

export function getImportedCredByHash(credHash: string, wal: models.wallet): models.credential | undefined {
    logger("creds - Getting imported credential", credHash)

    if (wal.importedCredentials) {
        const iCred = wal.importedCredentials.find((cred) => {
            const curCredHash = cred.verifiedCredential.proof.hash
            if (curCredHash === credHash) {
                logger("creds - Found cred hash", curCredHash)
                return true
            } else {
                logger("creds - cred hash", curCredHash, "does not match", credHash)
                return false
            }
        })
        if (iCred) {
            logger("creds - got imported cred w/keys", Object.keys(iCred))
            return iCred
        }
    } else {
        logger("creds - No imported credential hash", credHash)
        return;
    }
}

export function getImportedCreds(wal: models.wallet): models.credential[] {
    logger("creds - Getting imported credentials")
    let result: credential[] = []
    logger("creds - current wal has keys", Object.keys(wal))
    if (wal["importedCredentials"]) {
        const creds = wal["importedCredentials"];
        if (creds && creds.length > 0) {
            logger("creds - getting imported creds", creds.length)
            creds.forEach(cred => logger("creds - imported cred", JSON.stringify(cred)))
            result = creds
        } else {
            logger("creds - no imported creds found")
        }
    } else {
        logger("creds - No imported credentials")
    }
    return result;
}

export function getIssuedCreds(wal: models.wallet): models.credential[] {
    logger("creds - Getting issued credentials")
    let result: credential[] = []
    logger("creds - current wal has keys", Object.keys(wal))
    if (wal.issuedCredentials) {
        const creds = wal.issuedCredentials
        if (creds && creds.length > 0) {
            logger("creds - getting issued creds", creds.length)
            creds.forEach(cred => logger("creds - issued cred", JSON.stringify(cred)))
            result = creds
        } else {
            logger("creds - no issued creds found")
        }
    } else {
        logger("creds - No issued credentials")
    }
    return result;
}

export function getIssuedCredByAlias(credAlias: string, wal: models.wallet): models.issuedCredential | undefined {
    logger("creds - Getting issued credential by alias", credAlias)

    if (wal.issuedCredentials) {
        const iCred = wal.issuedCredentials.find((cred) => {
            if (cred.alias === credAlias) {
                logger("creds - Found issued cred alias", credAlias)
                return true
            } else {
                logger("creds - issued cred alias", cred.alias, "does not match", credAlias)
                return false
            }
        })
        if (iCred) {
            logger("creds - got issued cred w/keys", Object.keys(iCred))
            return iCred
        }
    } else {
        logger("creds - No issued credential alias", credAlias)
        return;
    }
}

export function getIssuedCredByHash(credHash: string, wal: models.wallet): models.issuedCredential | undefined {
    logger("creds - Getting issued credential by hash", credHash)

    if (wal.issuedCredentials) {
        const iCred = wal.issuedCredentials.find((cred) => {
            const curCredHash = cred.verifiedCredential.proof.hash
            if (curCredHash === credHash) {
                logger("creds - Found issued cred hash", curCredHash)
                return true
            } else {
                logger("creds - issued cred hash", curCredHash, "does not match", credHash)
                return false
            }
        })
        if (iCred) {
            logger("creds - got issued cred w/keys" + Object.keys(iCred))
            return iCred
        }
    } else {
        logger("creds - No issued credential hash", credHash)
        return;
    }
}

export function getShareableCred(iCred: models.credential) {
    logger("creds - getting shareable cred for cred", JSON.stringify(iCred))
    const shareable = {
        encodedSignedCredential: iCred.verifiedCredential.encodedSignedCredential,
        proof: iCred.verifiedCredential.proof,
    }
    return shareable
}

export function hasNewCred() {
    logger("creds - triggering cred refresh", refreshTriggers.length)
    refreshTriggers.forEach(trigger => trigger())
}

export function isIssuedCred(cred: credential) {
    if ((cred as issuedCredential).issuingDidAlias) {
        logger("creds - cred is issued cred", JSON.stringify(cred))
        return true
    } else {
        logger("creds - cred is NOT issued cred", JSON.stringify(cred))
        return false
    }
}

export async function issueCredential(didAlias: string, iCred: models.issuedCredential, wal: models.wallet): Promise<models.wallet | undefined> {
    const credJson = JSON.stringify(iCred)
    console.log("creds - issuing credential", didAlias, credJson)
    let result;

    try {
        const newWalJson = await PrismModule.issueCred(JSON.stringify(wal), didAlias, credJson);
        logger("creds - wallet after issuing credential", newWalJson)
        if (newWalJson) {
            return JSON.parse(newWalJson)
        } else {
            console.error("creds - Could not issue credential")
        }
    } catch (error: any) {
        console.error("creds - Could not issue credential to", didAlias, iCred, error, error.stack)
    }

    return result
}

export async function revokeCredentialByHash(credHash: string, wal: models.wallet): Promise<models.wallet | undefined> {
    logger("creds - Revoking credential", credHash)
    const issuedCred = getIssuedCredByHash(credHash, wal)
    if (issuedCred) {
        return await revokeCredential(issuedCred, wal)
    } else {
        console.error("creds - could not revoke credential by hash", credHash)
        return issuedCred
    }
}

export async function revokeCredential(issuedCred: models.issuedCredential, wal: models.wallet): Promise<models.wallet | undefined> {
    logger("creds - Revoking issued credential w/keys", Object.keys(issuedCred))
    const jsonWallet = JSON.stringify(wal)
    console.log("creds - Revoking issued cred", issuedCred.alias, jsonWallet)
    const newWalJson = await PrismModule.revokeCred(jsonWallet, issuedCred.alias)
    if (newWalJson) {
        return JSON.parse(newWalJson)
    } else {
        console.error("Could not revoke accepted credential", issuedCred.alias)
        return
    }
}

export async function verifyCredentialByHash(credHash: string, wal: models.wallet): Promise<string | undefined> {
    logger("Verifying credential", credHash)
    try {
        const cred = getCredByHash(credHash, wal)
        if (cred) {
            console.log("creds - Got cred for verification", JSON.stringify(cred));
            const issued = isIssuedCred(cred)
            logger("creds - is cred issued?", issued)
            const messageArray = await PrismModule.verifyCred(JSON.stringify(wal), cred.alias, !issued)
            return messageArray
        } else {
            console.error("creds - could not verify credential by hash, no cred found", credHash)
        }
    } catch (error: any) {
        console.error("creds - Could not verify credential by hash", credHash, error, error.stack)
    }
}

export function getDemoCred(did: models.did): models.credential {
    // if(currentDemoCred >= (demoCredOrder.length-1)) {
    return getFakeCredItem(did)
    // } else {
    //     currentDemoCred++
    //     return asCredShareable(demoCreds[demoCredOrder[currentDemoCred]])
    // }
}

function getFakeCredItem(did: models.did): models.credential {
    const today = new Date(Date.now());
    const credSub = {
        name: "Demo Credential " + today.getMilliseconds().toString(),
        achievement: "Created fake cred",
        date: today.toISOString(),
        id: did.uriLongForm,
    }
    // const credSubJson = JSON.stringify(credSub)
    const decodedSignedCred = {
        id: did.uriCanonical,
        keyId: "issuing0",
        credentialSubject: credSub,
    }
    const prf: models.proof = {
        hash: today.getMilliseconds().toString(),
        index: 1,
    };
    const esc = encodeCredential(decodedSignedCred)
    const verCred: models.vc = {
        encodedSignedCredential: esc,
        proof: prf,
    }
    return {
        alias: "demoCred" + today.getMilliseconds().toString(),
        verifiedCredential: verCred,
    }
}
