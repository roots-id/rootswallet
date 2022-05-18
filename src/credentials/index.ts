import * as models from '../models'
import { logger } from '../logging'
import * as store from '../store'

import certificateLogo from '../assets/ATALAPRISM.png';
export const certLogo = certificateLogo;

export const allCertsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_CERT)+'*')

export const refreshTriggers = []

export function addRefreshTrigger(trigger) {
    logger("certs - adding refresh trigger")
    refreshTriggers.push(trigger)
}

export function hasNewCreds() {
    logger("certs - triggering cert refresh",refreshTriggers.length)
   refreshTriggers.forEach(trigger=>trigger())
}

export function getCredentials() {
    logger("certs - getting cert items")
    const certItemJsonArray = store.getItems(allCertsRegex)
    logger("certs - got cert items",String(certItemJsonArray))
    const certs = certItemJsonArray.map(certItemJson => JSON.parse(certItemJson))
    return certs;
}

export function getCertItem(certId) {
    logger("certs - Getting cert",certId)
    if(certId) {
        const certItemJson = store.getItem(models.getStorageKey(certId,models.MODEL_TYPE_CERT));
        logger("certs - Got cert json",certItemJson)
        if(certItemJson) {
            const certItem = JSON.parse(certItemJson)
            logger("certs - cert w/keys",Object.keys(certItem))
            return certItem
        } else {
            logger("certs - cert not found",certId)
            return certItemJson
        }
    } else {
        logger("certs - can't get cert for undefined certId",certId)
    }
}

export function getShareableCertByAlias(alias: string) {
    logger("roots - getting shareable cert by alias",alias)
    const cert = getCertItem(alias)
    const shareable = {
        displayName: cert.displayName,
        displayPictureUrl: cert.displayPictureUrl,
        did: cert.did,
    }
    return shareable
}

export function showCert(navigation,cert) {
    console.log("cert - show cert",cert)
    navigation.navigate('Certificate Details',{cert: getShareableCertByAlias(cert)})
}