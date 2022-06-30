import { logger } from '../logging';

export const MODEL_TYPE_CHAT = "rootsChatType"
export const MODEL_TYPE_MESSAGE = "rootsMsgType"
export const MODEL_TYPE_CREDENTIAL = "rootsCredentialType"
export const MODEL_TYPE_CRED_REQUEST = "rootsCredRequestType"
export const MODEL_TYPE_USER = "rootsUserType"

export function createChat(chatAlias: string, titlePrefix?: string) {
    const chat = {
         id: chatAlias,
         published: false,
         title: titlePrefix+chatAlias,
    }
    logger("models - created chat model w/keys",Object.keys(chat))
    return chat;
}

export function createMessage(idText: string,bodyText: string,statusText: string,timeInMillis: number,userId: string,system?: boolean=false) {
    const msg = {
        id: idText,
        body: bodyText,
        type: statusText,
        createdTime: timeInMillis,
        user: userId,
        system: system,
    }
    logger("models - created msg model w/keys",Object.keys(msg))
    return msg;
}

export function createUser(userAlias: string, userName: string, userPicUrl: string) {
    const user = {
        id: userAlias,
        displayName: userName,
        displayPictureUrl: userPicUrl,
    }
    logger("models - create user model w/keys",Object.keys(user))
    return user;
}