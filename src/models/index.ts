import {logger} from '../logging';
import {QuickReplies} from 'react-native-gifted-chat';
import {replaceSpecial} from '../utils';

const ID_SEPARATOR = "_"

export const CRED_ISSUE_TX = "ISSUE_CREDENTIAL"
export const DID_PUBLISH_TX = "PUBLISH_DID"

//these types must be unique enough to use in regex without conflict
export enum ModelType {
    CHAT = "rootsChatType",
    CREDENTIAL = "rootsCredentialType",
    CRED_REQUEST = "rootsCredRequestType",
    MESSAGE = "rootsMsgType",
    CONTACT = "rootsContactType",
    SETTING = "rootsSettingType",
}

export enum ExportType {
    ASYNC_STORE = "rootsExportAsyncStoreType",
}

export type addOn = {
    transactionId: string,
    ledger: string,
    timestampInfo: timeStampInfo,
}

export type authState = {
    userToken: wallet,
    isLoading: boolean,
}

export type authToken = {
    type: string,
    token: wallet,
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

export type mediator = {
    routingKey: string
}

export type chat = {
    id: string,
    fromDids: string[]
    toDids: string[],
    fromAlias: string,
    title: string,
    mediator?: mediator,
}

export type compressedEcKeyData = {
    curve: string,
    data: string,
}

export type contact = {
    did: string,
    didDoc?: didDocument,
    id: string,
}

export type contactDecorator = contact & {
    displayName: string,
    displayPictureUrl: string,
}

export type credential = {
    alias: string,
    verifiedCredential: vc,
}

export type credentialDecorator = credential & {
    date: number,
    displayPictureUrl: string,
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

export type exportAll = {
    exportStorage: string,
    exportWallet: string,
}

export type exportKeyValue = {
    key: string,
    value: Object,
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
    body: string,
    type: string,
    createdTime: number,
    data: any,
    id: string,
    image?: string,
    quickReplies?: QuickReplies,
    rel: string,
    system: boolean,
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
    onReceivedMessage: (message: message) => void,
    onReceivedKeystrokes: (keystrokes: string) => void,
    onTypingStarted: (user: string) => void,
    onTypingStopped: (user: string) => void,
    onParticipantEnteredChat: (user: string) => void,
    onParticipantLeftChat: (user: string) => void,
    onParticipantPresenceChanged: (user: string) => void,
    onMessageRead: (message: message, receipt: boolean) => void,
    onMessageUpdated: (message: message) => void,
    onChatUpdated: (chat: chat) => void,
    onProcessing: (processing: boolean) => void,
}

export type sessionStatus = {
    succeeded: string,
    end: string,
    error: string,
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

export function createChat(id: string, fromDidAlias: string,
                    fromDids: string[], toDids: string[],  title = id): chat {
    const chat = {
        id: id,
        fromDids: fromDids,
        toDids: toDids,
        fromAlias: fromDidAlias,
        title: title,
    }
    logger("models - created chat model w/keys", Object.keys(chat))
    return chat;
}

export function createMessage(idText: string, bodyText: string, statusText: string,
                              timeInMillis: number, relId: string, system = false, data: any): message {
    const msg = {
        body: bodyText,
        createdTime: timeInMillis,
        data: data,
        id: idText,
        rel: relId,
        system: system,
        type: statusText,
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




//W3C Credential  model

// {
//     "@context": [
//         "https://www.w3.org/2018/credentials/v1",
//         "https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/jff-vc-edu-plugfest-1-context.json"
//     ],
//     "id": "a6aacfeb-8bd3-4ba7-aa85-475c3e507224",
//     "type": [
//         "VerifiableCredential",
//         "OpenBadgeCredential"
//     ],
//     "issuer": {
//         "type": "Profile",
//         "id": "did:peer:2.Ez6LSgha8XTjpYsHf5rf5zuKcEwrp9QKZ3Ue2zfXsg9mVRmjs.Vz6Mkh3p86Yd1yr5NZpZ6Ed1rdkKW8hvMoc2pJXid2fbNZUjr.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAiLCJhIjpbImRpZGNvbW0vdjIiXX0",
//         "name": "Jobs for the Future (JFF)",
//         "url": "https://www.jff.org/",
//         "image": "https://kayaelle.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png"
//     },
//     "issuanceDate": "2022-10-26T16:16:28Z",
//     "credentialSubject": {
//         "type": "AchievementSubject",
//         "id": "did:peer:2.Ez6LSrtQAkc2aCvhGTpCMmD9XJdAKC6GczsYfaCk31t4P2jvj.Vz6MkhsGaA4tCMFRun9YLZQ2KbiayfuLPTapejYRfjUpNqFRc.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOiJodHRwczovL3d3dy5leGFtcGxlLmNvbS9ob2xkZXIiLCJhIjpbImRpZGNvbW0vdjIiXX0",
//         "achievement": {
//             "type": "Achievement",
//             "name": "IIW 2022 DEMO",
//             "description": "This wallet can display this Open Badge 3.0",
//             "criteria": {
//                 "type": "Criteria",
//                 "narrative": "The first cohort of the JFF Plugfest 1 in May/June of 2021 collaborated to push interoperability of VCs in education forward."
//             },
//             "image": "https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/plugfest-1-badge-image.png"
//         }
//     },
//     "options": {
//         "proofType": "Ed25519Signature2018"
//     },
//     "proof": {
//         "type": "Ed25519Signature2018",
//         "created": "2022-10-26T16:16:28Z",
//         "verificationMethod": "did:peer:2.Ez6LSgha8XTjpYsHf5rf5zuKcEwrp9QKZ3Ue2zfXsg9mVRmjs.Vz6Mkh3p86Yd1yr5NZpZ6Ed1rdkKW8hvMoc2pJXid2fbNZUjr.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAiLCJhIjpbImRpZGNvbW0vdjIiXX0",
//         "proofPurpose": "assertionMethod",
//         "jws": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vdzNjLWNjZy5naXRodWIuaW8vdmMtZWQvcGx1Z2Zlc3QtMS0yMDIyL2pmZi12Yy1lZHUtcGx1Z2Zlc3QtMS1jb250ZXh0Lmpzb24iXSwiaWQiOiJhNmFhY2ZlYi04YmQzLTRiYTctYWE4NS00NzVjM2U1MDcyMjQiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiT3BlbkJhZGdlQ3JlZGVudGlhbCJdLCJpc3N1ZXIiOnsidHlwZSI6IlByb2ZpbGUiLCJpZCI6ImRpZDpwZWVyOjIuRXo2TFNnaGE4WFRqcFlzSGY1cmY1enVLY0V3cnA5UUtaM1VlMnpmWHNnOW1WUm1qcy5WejZNa2gzcDg2WWQxeXI1TlpwWjZFZDFyZGtLVzhodk1vYzJwSlhpZDJmYk5aVWpyLlNleUpwWkNJNkltNWxkeTFwWkNJc0luUWlPaUprYlNJc0luTWlPaUpvZEhSd09pOHZNVEkzTGpBdU1DNHhPamd3TURBaUxDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaVhYMCIsIm5hbWUiOiJKb2JzIGZvciB0aGUgRnV0dXJlIChKRkYpIiwidXJsIjoiaHR0cHM6Ly93d3cuamZmLm9yZy8iLCJpbWFnZSI6Imh0dHBzOi8va2F5YWVsbGUuZ2l0aHViLmlvL3ZjLWVkL3BsdWdmZXN0LTEtMjAyMi9pbWFnZXMvSkZGX0xvZ29Mb2NrdXAucG5nIn0sImlzc3VhbmNlRGF0ZSI6IjIwMjItMTAtMjZUMTY6MTY6MjhaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsidHlwZSI6IkFjaGlldmVtZW50U3ViamVjdCIsImlkIjoiZGlkOnBlZXI6Mi5FejZMU3J0UUFrYzJhQ3ZoR1RwQ01tRDlYSmRBS0M2R2N6c1lmYUNrMzF0NFAyanZqLlZ6Nk1raHNHYUE0dENNRlJ1bjlZTFpRMktiaWF5ZnVMUFRhcGVqWVJmalVwTnFGUmMuU2V5SnBaQ0k2SW01bGR5MXBaQ0lzSW5RaU9pSmtiU0lzSW5NaU9pSm9kSFJ3Y3pvdkwzZDNkeTVsZUdGdGNHeGxMbU52YlM5b2IyeGtaWElpTENKaElqcGJJbVJwWkdOdmJXMHZkaklpWFgwIiwiYWNoaWV2ZW1lbnQiOnsidHlwZSI6IkFjaGlldmVtZW50IiwibmFtZSI6IklJVyAyMDIyIERFTU8iLCJkZXNjcmlwdGlvbiI6IlRoaXMgd2FsbGV0IGNhbiBkaXNwbGF5IHRoaXMgT3BlbiBCYWRnZSAzLjAiLCJjcml0ZXJpYSI6eyJ0eXBlIjoiQ3JpdGVyaWEiLCJuYXJyYXRpdmUiOiJUaGUgZmlyc3QgY29ob3J0IG9mIHRoZSBKRkYgUGx1Z2Zlc3QgMSBpbiBNYXkvSnVuZSBvZiAyMDIxIGNvbGxhYm9yYXRlZCB0byBwdXNoIGludGVyb3BlcmFiaWxpdHkgb2YgVkNzIGluIGVkdWNhdGlvbiBmb3J3YXJkLiJ9LCJpbWFnZSI6Imh0dHBzOi8vdzNjLWNjZy5naXRodWIuaW8vdmMtZWQvcGx1Z2Zlc3QtMS0yMDIyL2ltYWdlcy9wbHVnZmVzdC0xLWJhZGdlLWltYWdlLnBuZyJ9fSwib3B0aW9ucyI6eyJwcm9vZlR5cGUiOiJFZDI1NTE5U2lnbmF0dXJlMjAxOCJ9fQ.LfEu2D4mk_BoFXAftRcDCGmi0lkTunOi5oxTMZHc2-E"
//     }
// }

//The following is an example of a Verifiable Credential that is signed with a JWS and contains a proof that is a JWS.

export type W3CVerifiableCredential = {
    "@context": string[];
    id: string;
    type: string[];
    issuer: W3CIssuer;
    issuanceDate: string;
    credentialSubject: W3CCredentialSubject;
    proof: W3CProof;
};

export type W3CIssuer = {
    id: string;
    type: string;
    data: any;
};

export type W3CCredentialSubject = {
    id: string;
    type: string;
    name: string;
    url?: string;
    image?: string;
};

export type W3CProof = {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
};

