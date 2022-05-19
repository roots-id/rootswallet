import * as models from '../models'
import { logger } from '../logging'
import * as store from '../store'

import apLogo from '../assets/ATALAPRISM.png';
import butchLogo from '../assets/butch.png'
import catalystPng from '../assets/catalyst.png'
import darrellLogo from '../assets/darrell.png'
import estebanLogo from '../assets/esteban.png'
import iogLogo from '../assets/iog.png'
import lanceLogo from '../assets/lance.png'
import perLogo from '../assets/smallBWPerson.png';
import rodoLogo from '../assets/rodo.png'
import rwLogo from '../assets/LogoCropped.png';
import starPng from '../assets/star.png';
import tonyLogo from '../assets/tony.png';

export const prismLogo = apLogo;
export const catalystLogo = catalystPng;
export const personLogo = perLogo;
export const rootsLogo = rwLogo;
export const starLogo = starPng;

export const YOU_ALIAS = "You"
export const ROOTS_BOT = "RootsWallet Helper";
export const PRISM_BOT = "Prism Helper";

export const LIBRARY_BOT = "did:prism:librarybot1";
const IOG_TECH = "did:prism:iogtech1";
const ROOTSID = "did:prism:rootsid";
const LANCE = "did:prism:lance";
const TONY = "did:prism:tony";
const DARRELL = "did:prism:darrell";
const BUTCH = "did:prism:butch";
const ESTEBAN = "did:prism:esteban";
const RODO = "did:prism:rodolfo";

export const allRelsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_REL)+'*')

export const refreshTriggers = []

let currentDemoRel = -1
const demoRelOrder = [ESTEBAN,RODO,LANCE,BUTCH,DARRELL,TONY,ROOTSID,IOG_TECH,LIBRARY_BOT]
const demoRels = {}
demoRels[LIBRARY_BOT] = [LIBRARY_BOT,"Library",personLogo,LIBRARY_BOT]
demoRels[IOG_TECH] = [IOG_TECH, "IOG Tech Community",iogLogo,IOG_TECH]
demoRels[ROOTSID] = [ROOTSID, "RootsID",rootsLogo,ROOTSID]
demoRels[LANCE] = [LANCE, "MeGrimLance",lanceLogo,LANCE]
demoRels[TONY] = [TONY,"Tony.Rose",tonyLogo,TONY]
demoRels[DARRELL] = [DARRELL,"Darrell O'Donnell",darrellLogo,DARRELL]
demoRels[BUTCH] = [BUTCH,"Butch Clark",butchLogo,BUTCH]
demoRels[ESTEBAN] = [ESTEBAN,"Esteban Garcia",estebanLogo,ESTEBAN]
demoRels[RODO] = [RODO,"Rodolfo Miranda",rodoLogo,RODO]

export function addRefreshTrigger(trigger) {
    logger("rels - adding refresh trigger")
    refreshTriggers.push(trigger)
}

//TODO unify aliases and storageKeys?
export async function createRelItem(alias: string, name: string, pic=personLogo, did?: string) {
    try {
        logger("create rel item",alias,name,pic);
        if(getRelItem(alias)) {
            logger("rels - rel already exists",alias)
            return true;
        } else {
            logger("rels - rel did not exist",alias)
            const relItem = models.createRel(alias, name, pic,did)
            const relItemJson = JSON.stringify(relItem)
            logger("rels - generated rel",relItemJson)
            const result = await store.saveItem(models.getStorageKey(alias, models.MODEL_TYPE_REL), relItemJson)
            logger("rels - created rel",alias,"?",result)
            hasNewRels()
            return result;
        }
    } catch(error) {
        console.error("Failed to create rel",alias,error,error.stack)
        return false
    }
}

export function hasNewRels() {
    logger("rels - triggering rel refresh",refreshTriggers.length)
   refreshTriggers.forEach(trigger=>trigger())
}

export function getRelationships() {
    logger("rels - getting rel items")
    const relItemJsonArray = store.getItems(allRelsRegex)
    logger("rels - got rel items",String(relItemJsonArray))
    const rels = relItemJsonArray.map(relItemJson => JSON.parse(relItemJson))
    return rels;
}

export function getRelItem(relId) {
    logger("rels - Getting rel",relId)
    if(relId) {
        const relItemJson = store.getItem(models.getStorageKey(relId,models.MODEL_TYPE_REL));
        logger("rels - Got rel json",relItemJson)
        if(relItemJson) {
            const relItem = JSON.parse(relItemJson)
            logger("rels - rel w/keys",Object.keys(relItem))
            return relItem
        } else {
            logger("rels - rel not found",relId)
            return relItemJson
        }
    } else {
        logger("rels - can't get rel for undefined relId",relId)
    }
}

export function isShareable(rel: object) {
    if(!rel.id && rel.did) {
        logger("rels - rel is shareable",rel.did)
        return true
    } else {
        logger("rels - rel NOT shareable",rel.id,rel.did)
    }
}

export function getShareableRelByAlias(alias: string) {
    logger("roots - getting shareable rel by alias",alias)
    const rel = getRelItem(alias)
    const shareable = {
        displayName: rel.displayName,
        displayPictureUrl: rel.displayPictureUrl,
        did: rel.did,
    }
    return shareable
}

export function showRel(navigation,rel) {
    console.log("rel - show rel",rel)
    navigation.navigate('Relationship Details',{rel: getShareableRelByAlias(rel)})
}

// export async function initDemoRels() {
//     logger("rels - init demo rels")
//     await createRelItem(LIBRARY_BOT,"Library",personLogo,LIBRARY_BOT)
//     await createRelItem(IOG_TECH, "IOG Tech Community",iogLogo,IOG_TECH);
//     await createRelItem(ROOTSID, "RootsID",rootsLogo,ROOTSID);
//     await createRelItem(LANCE, "MeGrimLance",lanceLogo,LANCE);
//     await createRelItem(TONY,"Tony.Rose",tonyLogo,TONY)
//     await createRelItem(DARRELL,"Darrell O'Donnell",darrellLogo,DARRELL)
//     await createRelItem(BUTCH,"Butch Clark",butchLogo,BUTCH)
//     await createRelItem(ESTEBAN,"Esteban Garcia",estebanLogo,ESTEBAN)
//     await createRelItem(RODO,"Rodolfo Miranda",rodoLogo,RODO)
// }

export function getDemoRel() {
    if(currentDemoRel >= (demoRelOrder.length-1)) {
        return getFakeRelItem()
    } else {
        currentDemoRel++
        const dRel = demoRelOrder[currentDemoRel]
        console.log("rels - get demo rel data for",dRel)
        const demoRel = demoRels[dRel]
        console.log("rels - got demo rel args",demoRel)
        const result = models.createRel(...demoRel)
        console.log("rels - got demo rel",result)
        return result
    }
}

function getFakeRelItem() {
   return {  dataType: "rel",
        displayPictureUrl: personLogo,
        displayName: "fakePerson"+Date.now(),
        did: "did:roots:fakedid"+Date.now(),
    }
}