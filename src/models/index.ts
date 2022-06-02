import {logger} from '../logging';
import {QuickReplies} from 'react-native-gifted-chat';
import {replaceSpecial} from '../utils';

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

export type addOn = {
    transactionId: string,
    ledger: string,
    timestampInfo: timeStampInfo,
}

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

export type compressedEcKeyData = {
    curve: string,
    data: string,
}

export interface contact extends contactShareable {
    id: string,
}

export type contactShareable = {
    displayName: string,
    displayPictureUrl: string,
    did: string,
    didDoc?: didDocument,
}

export type credential = {
    alias: string,
    verifiedCredential: vc,
}

export type credentialDetails = {
    hash: string, encoded: string, decoded: decodedSignedCredential,
}

//id: did:prism:13fa8c3c4ee3ae007b44f5fad55c1b16536f4bba755d5edcef636be910932dfa"
//keyId: issuing0
//credentialSubject: {"name":"Prism DID publisher","achievement":"Published a DID to Cardano - Atala Prism","date":"2022-06-02T11:37:49.851Z","id":"did:prism:13fa8c3c4ee3ae007b44f5fad55c1b16536f4bba755d5edcef636be910932dfa:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQOhWLYFJSgXyj14L2Z9ztTjH_wTnxv2ZTJiTf858_DzxBI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA7623sOMoMf3Hlxel3V9ClTVdpNcSLead7QCxhzQRTX3Ej8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiEDh_lYK9DBQER5Thr83c7oxB8TxJEhMtS8Q9KeCU3HbkY"}
export type decodedSignedCredential = {
    id: string,
    keyId: string,
    credentialSubject: object,
}

export type did = {
    alias: string,
    didIdx: number,
    keyPairs: key[],
    operationHash: string,
    uriCanonical: string,
    uriLongForm: string,
}

export type didDocument = {
    publicKeys: publicKey[]
}

export interface issuedCredential extends credential {
    batchId: string,
    claim: claim,
    credentialHash: string,
    issuingDidAlias: string,
    operationHash: string,
    revoked: boolean,
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
    data: any,
    quickReplies?: QuickReplies,
}

export type proof = {
    hash: string,
    index: number,
}

export type publicKey = {
    id: string,
    usage: string,
    addedOn: addOn,
    compressedEcKeyData: compressedEcKeyData,
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

export type timeStampInfo = {
    blockSequenceNumber: number,
    blockTimestamp: string,
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

export function createChat(chatAlias: string, fromDidAlias: string,
                           toIds: string[], title = chatAlias): chat {
    const chat = {
        id: chatAlias,
        toDids: toIds,
        fromAlias: fromDidAlias,
        title: title,
        published: false,
    }
    logger("models - created chat model w/keys", Object.keys(chat))
    return chat;
}

export function createMessage(idText: string, bodyText: string, statusText: string,
                              timeInMillis: number, relId: string, system = false, data: object): message {
    const msg = {
        id: idText,
        body: bodyText,
        type: statusText,
        createdTime: timeInMillis,
        rel: relId,
        system: system,
        data: data,
    }
    logger("models - created msg model w/keys", Object.keys(msg))
    return msg;
}

export function createMessageId(chatAlias: string, relId: string, msgNum: number): string {
    logger("model - creating message id", chatAlias, relId, msgNum)
    let msgId = getStorageKey(chatAlias, ModelType.MESSAGE) + ID_SEPARATOR + relId + ID_SEPARATOR + String(msgNum);
    logger("model - Generated msg id", msgId);
    return msgId;
}

//---------------- Keys -----------------------
export function getStorageKey(alias: string, type: string) {
//TODO this replacement happens in storage too.... unify
    return replaceSpecial(alias) + ID_SEPARATOR + type
}

export function getStorageKeys(aliases: string[], type: string) {
    return aliases.map(alias => getStorageKey(alias, type))
}