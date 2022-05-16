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
import rwLogo from '../assets/LogoOnly1024.png';
import starPng from '../assets/star.png';
import tonyLogo from '../assets/tony.png';

export const prismLogo = apLogo;
export const catalystLogo = catalystPng;
export const personLogo = perLogo;
export const rootsLogo = rwLogo;
export const starLogo = starPng;

export const YOU_ALIAS = "You"
export const HISTORY_ALIAS = "History"
export const ROOTS_BOT = "RootsWallet Bot";
export const PRISM_BOT = "Prism Bot";

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
            return result;
        }
    } catch(error) {
        console.error("Failed to create rel",alias,error,error.stack)
        return false
    }
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

// export async function initDemoRels() {
//     logger("rels - init demo rels")
//     await createRelItem(ROOTS_BOT,"RootsWallet",rootsLogo,ROOTS_BOT)
//     await createRelItem(PRISM_BOT,"Atala Prism",prismLogo,PRISM_BOT)
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