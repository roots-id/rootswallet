import * as models from '../models'
import { logger } from '../logging'
import * as store from '../store'

//TODO unify aliases and storageKeys?
export async function createRelItem(alias: string, name: string, pic: string) {
    try {
        if(getRelItem(alias)) {
            logger("roots - rel already exists",alias)
            return true;
        } else {
            logger("roots - rel did not exist",alias)
            const relItem = models.createRel(alias, name, pic)
            const relItemJson = JSON.stringify(relItem)
            logger("generated rel",relItemJson)
            const result = await store.saveItem(models.getStorageKey(alias, models.MODEL_TYPE_REL), relItemJson)
            logger("roots - created rel",alias,"?",result)
            return result;
        }
    } catch(error) {
        console.error("Failed to create rel",alias,error,error.stack)
        return false
    }
}

export function getRelItem(relId) {
    logger("roots - Getting rel",relId)
    if(relId) {
        const relItemJson = store.getItem(models.getStorageKey(relId,models.MODEL_TYPE_REL));
        logger("roots - Got rel json",relItemJson)
        if(relItemJson) {
            const relItem = JSON.parse(relItemJson)
            logger("roots - rel w/keys",Object.keys(relItem))
            return relItem
        } else {
            logger("roots - rel not found",relId)
            return relItemJson
        }
    } else {
        logger("roots - can't get rel for undefined relId",relId)
    }
}