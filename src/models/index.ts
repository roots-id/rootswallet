import { logger } from '../logging';
import { QuickReplies} from 'react-native-gifted-chat';
import { replaceSpecial } from '../utils';

const ID_SEPARATOR = "_"

//these types must be unique enough to use in regex without conflict
export enum ModelType {
     CHAT = "rootsChatType",
     CREDENTIAL = "rootsCredentialType",
     CRED_REQUEST = "rootsCredRequestType",
     MESSAGE = "rootsMsgType",
     CONTACT = "rootsContactType",
     SETTING = "rootsSettingType",
}

//TODO refactor away this general file to specific files, like 'chat'

export type blocktxs = {
    action: string,
    description: string,
    txId: string,
    url: string,
}

export type claim = {
    content: string,
    subjectDid: string,
}

export type chat = {
    id: string,
    toDids: string[],
    fromAlias: string,
    title: string,
    published: boolean,
}

export type contact = {
    id: string,
    displayName: string,
    displayPictureUrl: string,
    did?: string,
}

export type credential = {
    alias: string,
    batchId: string,
    claim: claim,
    verifiedCredential: vc,
}

export interface issuedCredential extends credential {
        credentialHash: string,
        issuingDidAlias: string,
        operationHash: string,
        revoked: boolean,
}

export type did = {
    alias: string,
    didIdx: number,
    keyPairs: key[],
    operationHash: string,
    uriCanonical: string,
    uriLongForm: string,
}

export type key = {
    didIdx: number,
    keyDerivation: number,
    keyId: string,
    keyIdx: number,
    keyTypeValue: number,
    privateKey: string,
    publicKey: string,
}

export type message = {
    id: string,
    body: string,
    type: string,
    createdTime: number,
    rel: string,
    system: boolean,
    data: object,
    quickReplies?: QuickReplies,
}

export type proof = {
    hash: string,
    index: number,
}

export type session = {
    chat: chat,
    onReceivedMessage: (message: message) => {},
    onReceivedKeystrokes: (keystrokes: string) => {},
    onTypingStarted: (user: string) => {},
    onTypingStopped: (user: string) => {},
    onParticipantEnteredChat: (user: string) => {},
    onParticipantLeftChat: (user: string) => {},
    onParticipantPresenceChanged: (user: string) => {},
    onMessageRead: (message: message, receipt: boolean) => {},
    onMessageUpdated: (message: message) => {},
    onChatUpdated: (chat: chat) => {},
    onProcessing: (processing: boolean) => {},
}

export type sessionStatus = {
    succeeded: string,
    end: string,
}

export type vc = {
    encodedSignedCredential: string,
    proof: proof,
}


export type wallet = {
    _id: string,
    mnemonic: string,
    passphrase: string,
    dids: did[],
    importedCredentials: credential[],
    issuedCredentials: issuedCredential[],
    blockchainTxLogEntry: blocktxs[],
};

export function createChat(chatAlias: string, fromDidAlias: string, toIds: string[], title=chatAlias): chat {
    const chat = {
        id: chatAlias,
        toDids: toIds,
        fromAlias: fromDidAlias,
        title: title,
        published: false,
    }
    logger("models - created chat model w/keys",Object.keys(chat))
    return chat;
}

export function createMessage(idText: string,bodyText: string,statusText: string,timeInMillis: number,relId: string,system=false,data :object): message {
    const msg = {
        id: idText,
        body: bodyText,
        type: statusText,
        createdTime: timeInMillis,
        rel: relId,
        system: system,
        data: data,
    }
    logger("models - created msg model w/keys",Object.keys(msg))
    return msg;
}

export function createMessageId(chatAlias: string,relId: string,msgNum: number) {
    logger("model - creating message id",chatAlias,relId,msgNum)
    let msgId = getStorageKey(chatAlias,ModelType.MESSAGE)+ID_SEPARATOR+relId+ID_SEPARATOR+String(msgNum);
    logger("model - Generated msg id",msgId);
    return msgId;
}

export function createRel(relAlias: string, relName: string, relPicUrl: string, did?: string) :contact{
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