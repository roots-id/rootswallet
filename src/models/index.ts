import { logger } from '../logging';
import { replaceSpecial } from '../utils';

const ID_SEPARATOR = "_"

//these types must be unique enough to use in regex without conflict
export const MODEL_TYPE_CHAT = "rootsChatType"
export const MODEL_TYPE_MESSAGE = "rootsMsgType"
export const MODEL_TYPE_CREDENTIAL = "rootsCredentialType"
export const MODEL_TYPE_CRED_REQUEST = "rootsCredRequestType"
export const MODEL_TYPE_REL = "rootsRelType"

//TODO refactor away this general file to specific files, like 'chat'

export function createChat(chatAlias: string, fromDidAlias: string, toIds: string[], title=chatAlias) {
    const chat = {
         id: chatAlias,
         fromAlias: fromDidAlias,
         to: toIds,
         published: false,
         title: title,
    }
    logger("models - created chat model w/keys",Object.keys(chat))
    return chat;
}

export function createMessage(idText: string,bodyText: string,statusText: string,timeInMillis: number,relId: string,system?: boolean=false,cred?: Object=undefined) {
    const msg = {
        id: idText,
        body: bodyText,
        type: statusText,
        createdTime: timeInMillis,
        rel: relId,
        system: system,
        cred: cred,
    }
    logger("models - created msg model w/keys",Object.keys(msg))
    return msg;
}

export function createMessageId(chatAlias: string,relId: string,msgNum: number) {
    let msgId = getStorageKey(chatAlias,MODEL_TYPE_MESSAGE)+ID_SEPARATOR+relId+ID_SEPARATOR+String(msgNum);
    logger("roots - Generated msg id",msgId);
    return msgId;
}

export function createRel(relAlias: string, relName: string, relPicUrl: string, did?: string) {
    const rel = {
        id: relAlias,
        displayName: relName,
        displayPictureUrl: relPicUrl,
        did: did,
    }
    logger("models - create rel model w/keys",Object.keys(rel))
    return rel;
}

//---------------- Keys -----------------------
export function getStorageKey(alias: string,type: string) {
//TODO this replacement happens in storage too.... unify
    return replaceSpecial(alias)+ID_SEPARATOR+type
}

export function getStorageKeys(aliases: string[], type: string) {
    return aliases.map(alias => getStorageKey(alias,type))
}