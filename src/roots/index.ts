import * as cred from '../credentials'
import * as models from '../models'
import {logger} from '../logging'
import {PrismModule} from '../prism'
import {LogBox} from "react-native";
import * as contact from '../relationships'
import { Reply} from 'react-native-gifted-chat';
import * as store from '../store'
import * as utils from '../utils'
import * as wallet from '../wallet'
import {hasNewCred} from "../credentials";
import { startConversation } from './peerConversation';
import * as AsyncStore from '../store/AsyncStore'
import { credentialRequest, credentialPrism2Request } from '../protocols';

import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import {
    Ed25519VerificationKey2018,
    Ed25519Signature2018,
  } from "@transmute/ed25519-signature-2018";
import { randomBytes } from 'react-native-randombytes'
import vc from '@sphereon/rn-vc-js';


//msg types
export enum MessageType {
    BLOCKCHAIN_URL = "blockchainUrlMsgType",
    CREDENTIAL_JSON = "jsonCredential",
    DID = "didMsgType",
    PROMPT_RETRY_PROCESS = "rootsFailedProcessingMsgType",
    PROMPT_ACCEPT_CREDENTIAL = "rootsAcceptCredentialMsgType",
    PROMPT_OWN_CREDENTIAL = "rootsOwnCredentialMsgType",
    PROMPT_OWN_DID = "rootsOwnDidMsgType",
    PROMPT_PUBLISH = "rootsPromptPublishMsgType",
    PROMPT_ISSUED_CREDENTIAL = "rootsIssuedCredentialMsgType",
    STATUS = "statusMsgType",
    TEXT = "textMsgType",
    MEDIATOR_REQUEST_MEDIATE = "mediatorRequestMediate",
    MEDIATOR_KEYLYST_UPDATE = "mediatorKeyListUpdate",
    MEDIATOR_STATUS_REQUEST = "mediatorStatusReuqest",
    MEDIATOR_RETRIEVE_MESSAGES = "mediatorRetrieveMessages",
    SHOW_QR_CODE = "showQRCode",
    IIWCREDENTIAL = "iiwCredential",
    IIWCREDENTIALREQUEST = "iiwCredentialRequest",
    IIWACCEPTEDCREDENTIAL = "iiwAcceptedCredential",
    IIWREJECTEDCREDENTIAL = "iiwRejectedCredential",
    JFFCREDENTIAL = "jffCredential",
    JFFCREDENTIALOOB = "jffCredentialOOB",
    JFFCREDENTIALREQUEST = "jffCredentialRequest",
    JFFACCEPTEDCREDENTIAL = "jffAcceptedCredential",
    JFFREJECTEDCREDENTIAL = "jffRejectedCredential",
    AP2_CREDENTIAL_OFFER = "ap2CredentialOffer",
    AP2_CREDENTIAL_OFFER_ACCEPTED = "ap2CredentialOfferAccepted",
    AP2_CREDENTIAL_OFFER_DENIED = "ap2CredentialOfferDenied",
    AP2_CREDENTIAL_ISSUED = "ap2CredentialIssued",
    AP2_CREDENTIAL_ISSUED_ACCEPTED = "ap2CredentialIssuedAccepted",
    AP2_CREDENTIAL_ISSUED_DENIED = "ap2CredentialIssuedDenied",
    KYC_START = "kycStart",
    KYC_START_ACCEPTED = "kycStartAccepted",
    KYC_START_DENIED = "kycStartDenied",
    KYC_FRONT_PICTURE = "kycFrontPicture",
    KYC_FRONT_PICTURE_ACCEPTED = "kycPFronticture",
    KYC_SELFIE = "kycSelfie",
    KYC_SELFIE_ACCEPTED = "kycSelfieAccepted",
    
}

//meaningful literals
export const ACHIEVEMENT_MSG_PREFIX = "You have a new achievement: ";
export const BLOCKCHAIN_URL_MSG = "*Click to geek out on Cardano blockchain details*";
export const PUBLISHED_TO_PRISM = "Your DID was added to Prism";

//state literals
export const CRED_ACCEPTED = "credAccepted"
export const CRED_REJECTED = "credRejected"
export const CRED_REVOKE = "credRevoke"
export const CRED_VERIFY = "credVerify"
export const CRED_VIEW = "credView"
export const PUBLISH_DID = "publishDID"
export const CRED_REQUEST = "credRequest"

const allChatsRegex = new RegExp(models.getStorageKey("", models.ModelType.CHAT) + '*')
const allCredsRegex = new RegExp(models.getStorageKey("", models.ModelType.CREDENTIAL) + '*')
const allCredReqsRegex = new RegExp(models.getStorageKey("", models.ModelType.CRED_REQUEST) + '*')
const allMsgsRegex = new RegExp(models.getStorageKey("", models.ModelType.MESSAGE) + '*')
const allSettingsRegex = new RegExp(models.getStorageKey("", models.ModelType.SETTING) + '*')

export const POLL_TIME = 2000
//ppp-node-test
export const DEFAULT_PRISM_HOST = "ppp.atalaprism.io"
LogBox.ignoreAllLogs(true)
let demo = false;

type process = {
    endDate?: number,
    polling: NodeJS.Timer,
    startDate: number,
}

const allProcessing: { [processGroup: string]: { [processAlias: string]: process } } = {};
const sessions: { [chatId: string]: models.session } = {};

export async function initRootsWallet(userName: string): Promise<boolean> {
    logger("roots - initializing RootsWallet")
    const savedName = await contact.setUserName(userName)

    if(savedName) {
        logger("roots - initializing your Did")
        const cId = contact.generateIdFromName(userName)
        const createdDid = await createDid(cId)

        if (createdDid) {
            const didAlias = createdDid.alias

            logger("roots - initializing your narrator bots roots")
            const prism = await initRoot(contact.PRISM_BOT, didAlias, rootsDid(contact.PRISM_BOT), contact.PRISM_BOT, contact.prismLogo)
            const rw = await initRoot(contact.ROOTS_BOT, didAlias, rootsDid(contact.ROOTS_BOT), contact.ROOTS_BOT, contact.rootsLogo)
            // const av = await initRoot(contact.AVIERY_BOT, didAlias, rootsDid(contact.AVIERY_BOT), contact.AVIERY_BOT, contact.avieryLogo)

            logger("roots - initializing your root")
            const relCreated = await initRoot(cId, didAlias, createdDid.uriLongForm, userName, contact.catalystLogo);
            logger("roots - initialized your root", relCreated)
            const myRel = contact.getContactByAlias(cId)

            logger("roots - posting your personal initialization messages")
            const myChat = getChatItem(cId)
            const welcomeAchMsg = await sendMessage(myChat,
                "Welcome to your personal RootsWallet history!",
                MessageType.TEXT, contact.ROOTS_BOT)
            const achMsg = await sendMessage(myChat,
                "We'll post new wallet events here.",
                MessageType.TEXT, contact.ROOTS_BOT)
            // const createdWalletMsg = await sendMessage(myChat,
            //     "You created your wallet: " + wallet.getWallet()?._id, MessageType.TEXT, contact.ROOTS_BOT)
            const createdDidMsg = await sendMessage(myChat,
                "You created your first decentralized ID (called a DID)!",
                MessageType.TEXT, contact.ROOTS_BOT)
            await sendMessage(myChat, "Your new DID is being added to Prism so that you can receive verifiable credentials (called VCs) from other users and organizations like Catalyst, your school, rental companies, etc.",
                MessageType.TEXT, contact.PRISM_BOT)
            //intentionally not awaiting
            const procPub = async () => await processPublishResponse(myChat)
            procPub()
                // make sure to catch any error
                .catch(console.error);
            return true;
        }
    }

    return false;
}

export async function loadAll(walName: string, walPass: string): Promise<string> {
    try {
        const wal = await wallet.loadWallet(walName, walPass);
        if (wal) {
            const user = await contact.loadUserName();
            const chats = await loadItems(allChatsRegex)
            const rels = await loadItems(contact.allRelsRegex);
            const messages = await loadItems(allMsgsRegex);
            const credRequests = await loadItems(allCredReqsRegex);
            const creds = await loadItems(allCredsRegex);
            if (chats && rels && messages && credRequests && creds) {
                console.log("Successfully loaded wallet",wal)
                return "";
            } else {
                const errorMsg = "roots - Failed to load all items"
                    + "\n\t loaded chats: " + chats
                    + "\n\t loaded chats: " + rels
                    + "\n\t loaded chats: " + messages
                    + "\n\t loaded chats: " + credRequests
                    + "\n\t loaded chats: " + creds
                console.error(errorMsg)
                return errorMsg;
            }
        } else {
            const errorMsg = "Failed to load wallet " + walName
            logger("roots -",errorMsg)
            return errorMsg;
        }
    } catch(error: any) {
        console.error("Could not load wallet items",error,error.stack)
        return error.message()
    }
}

async function loadItems(regex: RegExp) {
    try {
        const result = await store.restoreByRegex(regex)
        if (result) {
            logger("roots - successfully loaded items w/regex", regex)
            return true;
        } else {
            console.error("roots - Failed to load items w/regex", regex)
            return false;
        }
    } catch (error: any) {
        console.error("roots - Failed to load items w/regex", regex, error, error.stack)
        return false;
    }
}

export async function storageStatus() {
    logger("roots - Getting storage status")
    await store.status();
}

export async function importVerifiedCredential(verCred: models.vc): Promise<boolean | undefined> {
    console.log("roots - handling scanned cred", JSON.stringify(verCred))
    const wal = wallet.getWallet()
    if (wal) {
        const iCred = {
            alias: "importedVerifiedCred" + Date.now(),
            verifiedCredential: verCred
        };
        return await cred.addImportedCredential(iCred, wal)
    } else {
        console.error("roots - Wallet not found")
    }
}

export async function importContact(con: models.contactDecorator): Promise<boolean> {
    console.log("roots - importing contact", JSON.stringify(con))
    await initRoot(con.id, contact.getUserId(), con.did, con.displayName, con.displayPictureUrl)
    //intentionally not awaiting
    const c = contact.getContactByDid(con.did)
    if(c) {
        //intentionally not awaiting
        hasNewContact(c)
        return true
    } else {
        return false;
    }
}

//----------------- Prism ----------------------
export function setPrismHost(host = DEFAULT_PRISM_HOST, port = "50053") {
    logger("roots - setting Prism host and port", host, port)
    PrismModule.setNetwork(host, port)
    store.updateItem(getSettingAlias("prismNodePort"), port)
    store.updateItem(getSettingAlias("prismNodeHost"), host)
}

export function getPrismHost() {
    const host = store.getItem(getSettingAlias("prismNodeHost"))
    return (host) ? host : DEFAULT_PRISM_HOST;
}

//--------------- Roots ----------------------
export async function initRoot(id: string, fromDidAlias: string, toDid: string, display = id, avatar = contact.personLogo, fromDid?:string) {
    logger("roots - creating root", id, fromDidAlias, toDid, display, avatar)
    try {
        const relCreated = await contact.createRelItem(id, display, avatar, toDid);
        logger("roots - rel created/existed?", relCreated)
        const con = contact.getContactByAlias(id)
        logger("roots - getting rel DID document")
        if (con && id !== contact.PRISM_BOT && id !== contact.ROOTS_BOT) {
            logger("roots - creating chat for rel", con.id)
            const chat = await createChat(id, fromDidAlias, toDid, display, fromDid)
            //not awaiting on purpose
            if (chat) {
                //TODO what should a new chat trigger?
                startConversation(id)


                //hasNewChat(getChatItem(alias));
            }
        }
        //intentionally not awaiting
        contact.hasNewRels()
        return true;
    } catch (error: any) {
        console.error("Failed to initRoot", error, error.stack)
        return false;
    }
}

//---------------- Settings -----------------------
function applyAppSettings() {
    setPrismHost(store.getItem(getSettingAlias("prismNodeHost")),
        store.getItem(getSettingAlias("prismNodePort")));
}

function getSettingAlias(key: string) {
    return models.getStorageKey(key, models.ModelType.SETTING)
}

export async function loadSettings() {
    const settings = await loadItems(allSettingsRegex)
    applyAppSettings();
    return settings;
}

//----------------- Wallet ---------------------

//------------------ DIDs ----------------
async function createDid(didAlias: string): Promise<models.did | undefined> {
    try {
        const existingDid = getDid(didAlias)
        if (existingDid) {
            console.error("roots - Chat/DID already exists", didAlias)
            return existingDid;
        } else {
            logger("roots - DID does not exist, creating", didAlias, "DID")
            const wal = wallet.getWallet()
            if (wal) {
                // const walletJson = wallet.getWalletJson(wal._id)
                // logger("roots - requesting chat/did from prism, w/wallet", walletJson)
                // const prismWalletJson = PrismModule.newDID(walletJson, didAlias)
                // logger("roots - Chat/prismDid added to wallet", prismWalletJson)
                // const saveResult = await wallet.updateWallet(wal._id, wal.passphrase, prismWalletJson)
                // if (saveResult) {
                //     const newDid = getDid(didAlias)
                //     logger("roots - did added to wallet", JSON.stringify(newDid))
                //     return newDid;
                // This code is for Rodo's build problem
                const newDid = {
                    alias: "DID",
                    didIdx: 0,
                    keyPairs: [],
                    operationHash: "fake",
                    uriCanonical: "fake",
                    uriLongForm: "fake",
                }

                 return newDid
                
                // } else {
                //     console.error("roots - could not save wallet with new DID", prismWalletJson)
                // }
            } else {
                console.error("roots - Wallet no found", wal)
            }
        }
    } catch (error: any) {
        console.error("Failed to create chat DID", error, error.stack)
        return;
    }
}

export function getDid(didAlias: string): models.did | undefined {
    logger("roots - getDid by alias", didAlias)
    const dids = wallet.getWallet()?.dids;
    if (dids) {
        logger("roots - # of current dids", dids.length);
        dids.forEach(did => logger("\tdid:", did.alias))
        const findDid = dids.find(did => (did.alias === didAlias));
        if (findDid) {
            logger("roots -  found did alias", didAlias, "w/keys:", Object.keys(findDid))
            return findDid
        } else {
            logger("roots - Couldn't find DID", didAlias)
            return;
        }
    } else {
        logger("roots - wallet has no DIDs to get.")
        return;
    }

}

function getDidPubTx(didAlias: string) {
    logger("roots - getting DID pub tx", didAlias)
    const txLogs = wallet.getWallet()?.blockchainTxLogEntry
    logger("roots - got tx logs", JSON.stringify(txLogs))
    const didPublishTxLog = txLogs?.find(txLog => (txLog.action === models.DID_PUBLISH_TX && txLog.description === didAlias))
    logger("roots - got DID publish tx log", JSON.stringify(didPublishTxLog))
    return didPublishTxLog;
}

function hasLongForm(did: models.did) {
    console.log("roots - checking DID has long form", did.uriLongForm);
    const hasLong = did.uriLongForm && did.uriLongForm.length > 0;
    if (hasLong) {
        logger("roots - DID has long form", did.uriLongForm);
        return true;
    } else {
        logger("roots - DID does not have long form", did.uriCanonical);
        return false;
    }
}

function isDidPublished(did: models.did): boolean {
    const didAlias = did.alias
    console.log("roots - checking DID has been published", didAlias);
    const didPubTxLog = getDidPubTx(didAlias)
    if (didPubTxLog) {
        logger("roots - DID was published", didPubTxLog)
        return true;
    } else {
        logger("roots - DID not published", didAlias)
        return false;
    }
}

export async function publishPrismDid(didAlias: string): Promise<boolean> {
    const did = getDid(didAlias)
    if (did) {
        logger("publishing DID", did.uriCanonical,
            "and long form", did.uriLongForm)
        if (!isDidPublished(did)) {
            const longFormDid = did.uriLongForm
            logger("roots - Publishing DID to Prism", longFormDid)
            try {
                const wal = wallet.getWallet()
                if (wal) {
                    const newWalJson = await PrismModule.publishDID(wallet.getWalletJson(wal._id), did.alias)
                    const result = await wallet.updateWallet(wal._id, wal.passphrase, newWalJson)
                    const pubDid = getDid(didAlias)
                    if (pubDid) {
                        return isDidPublished(pubDid)
                    } else {
                        console.error("roots - DID was NOT published", newWalJson)
                    }
                }
            } catch (error: any) {
                console.error("roots - Error publishing DID", longFormDid, "w/DID alias", didAlias, error, error.stack)
            }
        } else {
            logger("roots - already", PUBLISHED_TO_PRISM, did.alias)
            return true;
        }
    }
    return false;
}

//------------------ Chats  --------------
export async function createChat(alias: string, fromDidAlias: string, toDid: string, title = "Untitled", fromDid?: string) {
    logger("roots - Creating chat", alias, "for toDid", toDid, "and fromDidAlias", fromDidAlias, "w/ title", title)
    const chatItemCreated = await createChatItem(alias, fromDidAlias, toDid, title, fromDid)
    logger("roots - chat item created/existed?", chatItemCreated)
    const chatItem = getChatItem(alias)
    logger("roots - chat item", chatItem)

    if (chatItemCreated && chatItem) {
        logger("Created chat and added welcome to chat", chatItem.title)
        if (!(alias === contact.getUserId())) {
            const chMsg = await sendMessage(chatItem,
                "You are now in contact with " + title,
                MessageType.TEXT, contact.ROOTS_BOT)
            const statusMsg = await sendMessage(getChatItem(contact.getUserId()),
                "New contact added: " + title,
                MessageType.TEXT, contact.ROOTS_BOT)
        }
        return true;
    } else {
        console.error("Could not create chat", fromDidAlias, toDid, title);
        return false
    }
}

async function createChatItem(chatAlias: string, fromDidAlias: string, toDid: string,  title = chatAlias, fromDid?:string) {
    logger('roots - Creating a new chat item', chatAlias)
    if (getChatItem(chatAlias)) {
        logger('roots - chat item already exists', chatAlias)
        return true
    } else {
        const chatItem = models.createChat(chatAlias, fromDidAlias, fromDid? [fromDid]:[], [toDid], title)
        const savedChat = await store.saveItem(models.getStorageKey(chatAlias, models.ModelType.CHAT), JSON.stringify(chatItem))
        if (savedChat) {
            logger('roots - new chat saved', chatAlias)
            return true
        } else {
            logger('roots - could not save new chat', chatAlias)
            return false
        }
    }
}

//TODO iterate to verify DID connections if cache is expired
export async function getAllChats() {
    const allChats = getChatItems();

    const result = {paginator: {items: allChats}};
    result.paginator.items.forEach(function (item, index) {
        logger("roots - getting chats", index + ".", item.id);
    });
    return result;
}

export async function getChatByRel(rel: models.contactDecorator) {
    logger("getting chat by rel", rel.displayName)
    const chat = getChatItem(rel.displayName)
    logger("got chat by rel", chat.id)
    return chat
}

export function getChatItem(chatAlias: string) {
    logger("roots - getting chat item", chatAlias)
    const chatJson = store.getItem(models.getStorageKey(chatAlias, models.ModelType.CHAT))
    logger("roots - got chat", chatJson)
    if (chatJson) {
        const chat = JSON.parse(chatJson)
        logger("roots - parsed chat json w/keys", Object.keys(chat));
        return chat;
    } else {
        logger("roots - could not get chat item", chatAlias)
    }
}

//TODO make order of chats deterministic (likely should be most recent first)
export function getChatItems() {
    logger("roots - getting chat items")
    const chatItemJsonArray = store.getItems(allChatsRegex)
    logger("roots - got chat items", String(chatItemJsonArray))
    const chats = chatItemJsonArray.map(chatItemJson => JSON.parse(chatItemJson))
    return chats;
}

export async function hasNewContact(rel: models.contactDecorator) {
    if (isDemo()) {
        const chat = await getChatByRel(rel)
        const msg = await sendMessage(chat, "To celebrate your new contact, you are issuing "
            + chat.title + " a verifiable credential", MessageType.TEXT, contact.ROOTS_BOT)
        if (msg) {
            const iCred = await issueDemoContactCredential(chat, msg.id)
            if (iCred) {
                //const credPubTx = getCredPubTx(pubDid.alias,credIssueAlias)
                const credSuccess = await sendMessage(chat, "You have issued " + chat.title + " a verifiable credential!",
                    MessageType.PROMPT_ISSUED_CREDENTIAL, contact.ROOTS_BOT, false, iCred.credentialHash)
//                     const credLinkMsg = await sendMessage(chat,BLOCKCHAIN_URL_MSG,
//                         MessageType.BLOCKCHAIN_URL,rel.PRISM_BOT,false,credPubTx.url)
            } else {
                console.error("roots - unable to issue cred", chat, "for msg", msg.id)
            }
        }
    }
}

// ---------------- Messages  ----------------------

function addQuickReply(msg: models.message) {
    if (msg.type === MessageType.PROMPT_PUBLISH) {
        msg.quickReplies = {
            type: 'checkbox', keepIt: true,
            values: [
                {
                    title: 'Add to Prism',
                    value: MessageType.PROMPT_PUBLISH + PUBLISH_DID,
                    messageId: msg.id,
                }
            ],
        }
    }

    //TODO check for roots.MessageType.IIWCREDENTIAL 
    if (msg.type === MessageType.IIWCREDENTIAL) {
        msg.quickReplies = {
            type: 'checkbox', 
            keepIt: true,
            values: [
                {
                    title: 'Preview',
                    value: MessageType.IIWCREDENTIAL + CRED_VIEW,
                    messageId: msg.id,
                }
            ],
        }
    }
    
    if (msg.type === MessageType.IIWCREDENTIALREQUEST) {
        msg.quickReplies = {
            type: 'radio', 
            keepIt: true,
            values: [
                {
                    title: 'Accept',
                    value: MessageType.IIWACCEPTEDCREDENTIAL ,
                    messageId: msg.id,
                },
                {
                    title: 'Deny',
                    value: MessageType.IIWREJECTEDCREDENTIAL,
                    messageId: msg.id,
                }
            ],
        }
    }
    if (msg.type === MessageType.JFFCREDENTIALOOB) {
        msg.quickReplies = {
            type: 'radio', 
            keepIt: true,
            values: [
                {
                    title: 'Request JFF Credential',
                    value: MessageType.JFFCREDENTIAL,
                    messageId: msg.id,
                }
            ],
        }
    }

    if (msg.type === MessageType.JFFCREDENTIAL) {
        msg.quickReplies = {
            type: 'checkbox', 
            keepIt: true,
            values: [
                {
                    title: 'Preview',
                    value: MessageType.JFFCREDENTIAL + CRED_VIEW,
                    messageId: msg.id,
                }
            ],
        }
    }
    if (msg.type === MessageType.JFFCREDENTIALREQUEST) {
        msg.quickReplies = {
            type: 'radio',
            keepIt: true,
            values: [
                {
                    title: 'Accept',
                    value: MessageType.JFFACCEPTEDCREDENTIAL,
                    messageId: msg.id,
                },
                {
                    title: 'Deny',
                    value: MessageType.JFFREJECTEDCREDENTIAL,
                    messageId: msg.id,
                }
            ],
        }
    }
    if (msg.type === MessageType.PROMPT_OWN_DID) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: 'View',
                    value: MessageType.PROMPT_OWN_DID,
                    messageId: msg.id,
                }]
        }
    }
    if (msg.type === MessageType.PROMPT_ACCEPT_CREDENTIAL) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [{
                title: 'Accept',
                value: MessageType.PROMPT_ACCEPT_CREDENTIAL + CRED_ACCEPTED,
                messageId: msg.id,
            },
            ],
        }
    }
    if (msg.type === MessageType.PROMPT_ISSUED_CREDENTIAL) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [{
                title: 'View',
                value: MessageType.PROMPT_ISSUED_CREDENTIAL + CRED_VIEW,
                messageId: msg.id,
            }, {
                title: 'Revoke',
                value: MessageType.PROMPT_ISSUED_CREDENTIAL + CRED_REVOKE,
                messageId: msg.id,
            },
            ],
        }
    }
    if (msg.type === MessageType.PROMPT_OWN_CREDENTIAL) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: 'View',
                    value: MessageType.PROMPT_OWN_CREDENTIAL + CRED_VIEW,
                    messageId: msg.id,
                }]
        }
    }
    if(msg.type === MessageType.PROMPT_RETRY_PROCESS) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: 'Retry(Coming Soon)',
                    value: MessageType.PROMPT_RETRY_PROCESS,
                    messageId: msg.id,
                }]
        }
    }
    if(msg.type === MessageType.MEDIATOR_REQUEST_MEDIATE) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: "OK",
                    value: MessageType.MEDIATOR_REQUEST_MEDIATE,
                    messageId: msg.id,
                }]
        }
    }
    if(msg.type === MessageType.MEDIATOR_KEYLYST_UPDATE) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: "Generate QR code",
                    value: MessageType.MEDIATOR_KEYLYST_UPDATE,
                    messageId: msg.id,
                }]
        }
    }
    if(msg.type === MessageType.MEDIATOR_STATUS_REQUEST) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: "Check Messages",
                    value: MessageType.MEDIATOR_STATUS_REQUEST,
                    messageId: msg.id,
                }]
        }
    }
    if(msg.type === MessageType.SHOW_QR_CODE) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: "QR Code",
                    value: MessageType.SHOW_QR_CODE,
                    messageId: msg.id,
                }]
        }
    }
    if(msg.type === MessageType.MEDIATOR_RETRIEVE_MESSAGES) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: "QR Code",
                    value: MessageType.MEDIATOR_RETRIEVE_MESSAGES,
                    messageId: msg.id,
                }]
        }
    }
    if (msg.type === MessageType.AP2_CREDENTIAL_OFFER) {
        msg.quickReplies = {
            type: 'radio',
            keepIt: true,
            values: [
                {
                    title: 'Accept',
                    value: MessageType.AP2_CREDENTIAL_OFFER_ACCEPTED,
                    messageId: msg.id,
                },
                {
                    title: 'Deny',
                    value: MessageType.AP2_CREDENTIAL_OFFER_DENIED,
                    messageId: msg.id,
                }
            ],
        }
    }
    if (msg.type === MessageType.AP2_CREDENTIAL_ISSUED) {
        msg.quickReplies = {
            type: 'radio',
            keepIt: true,
            values: [
                {
                    title: 'Accept',
                    value: MessageType.AP2_CREDENTIAL_ISSUED_ACCEPTED,
                    messageId: msg.id,
                },
                {
                    title: 'Deny',
                    value: MessageType.AP2_CREDENTIAL_ISSUED_DENIED,
                    messageId: msg.id,
                }
            ],
        }
    }
    if (msg.type === MessageType.KYC_START) {
        msg.quickReplies = {
            type: 'radio',
            keepIt: true,
            values: [
                {
                    title: 'Yes',
                    value: MessageType.KYC_START_ACCEPTED,
                    messageId: msg.id,
                },
                {
                    title: 'No',
                    value: MessageType.KYC_START_DENIED,
                    messageId: msg.id,
                }
            ],
        }
    }
    if (msg.type === MessageType.KYC_SELFIE) {
        msg.quickReplies = {
            type: 'radio',
            keepIt: true,
            values: [
                {
                    title: 'Open camera',
                    value: MessageType.KYC_SELFIE_ACCEPTED,
                    messageId: msg.id,
                }
            ],
        }
    }
    if (msg.type === MessageType.KYC_FRONT_PICTURE) {
        msg.quickReplies = {
            type: 'radio',
            keepIt: true,
            values: [
                {
                    title: 'Open camera',
                    value: MessageType.KYC_FRONT_PICTURE_ACCEPTED,
                    messageId: msg.id,
                }
            ],
        }
    }
    return msg
}

function addMessageExtensions(msg: models.message) {
    msg = addQuickReply(msg)
    return msg
}

export function getMessagesByChat(chatAlias: string): models.message[] {
    logger("roots - getting message items for chat", chatAlias)
    const msgRegex = new RegExp('^' + models.getStorageKey(chatAlias, models.ModelType.MESSAGE) + '*')
    const msgItemJsonArray = store.getItems(msgRegex)
    logger("roots - got msg items", msgItemJsonArray.length)
    const chatMsgs = msgItemJsonArray.map(
        (msgItemJson) => {
            logger("parsing msg json", msgItemJson)
            return JSON.parse(msgItemJson);
        }
    )
    chatMsgs.sort((a: models.message, b: models.message) => (a.createdTime < b.createdTime) ? -1 : 1)
    return chatMsgs;
}

export function getMessageById(msgId: string): models.message | undefined {
    logger("roots - getting message by id", msgId)
    const msgJson = store.getItem(msgId)
    if (msgJson) {
        const msg = JSON.parse(msgJson)
        return msg
    } else {
        console.error("Cannot get message by id, not found", msgId)
    }
}

export function getMessagesByRel(relId: string) {
    logger("roots - getting message items by user", relId)
    const msgRegex = new RegExp(models.ModelType.MESSAGE + '_' + utils.replaceSpecial(relId) + '*')
    const msgItemJsonArray = store.getItems(msgRegex)
    logger("roots - got user msg items", msgItemJsonArray.length)
    const chatMsgs = msgItemJsonArray.map(
        (msgItemJson) => {
            logger("parsing msg json", msgItemJson)
            return JSON.parse(msgItemJson) as models.message;
        }
    )
    chatMsgs.sort((a, b) => (a.createdTime < b.createdTime) ? -1 : 1)
    return chatMsgs;
}

export async function sendMessages(chat: models.chat, msgs: string[], msgType: MessageType, contactAlias: string) {
    msgs.map(async (msg) => await sendMessage(chat, msg, msgType, contactAlias))
}

//TODO unify aliases and storageKeys?
export async function sendMessage(chat: models.chat, msgText: string, msgType: MessageType, contactAlias: string, system = false, data: any = {}) {
    const msgTime = Date.now()
    const relDisplay = contact.getContactByAlias(contactAlias)
    if (relDisplay) {
        logger("roots - rel", relDisplay.id, "sending", msgText, "to chat", chat.id);
        const msgId = models.createMessageId(chat.id, relDisplay.id, msgTime);
        let msg = models.createMessage(msgId, msgText, msgType, msgTime, relDisplay.id, system, data);
        msg = addMessageExtensions(msg);
        try {
            const msgJson = JSON.stringify(msg)
            const result = await store.saveItem(msg.id, msgJson)
            if (result) {
                if (sessions[chat.id]) {
                    logger("roots - sending message to onReceivedMessage", chat.id, msgJson)
                    sessions[chat.id].onReceivedMessage(msg)
                } else {
                    console.log("roots - no session yet for", chat.id)
                }
                logger("roots - Sent/Stored message", msgJson)
                return msg
            } else {
                console.error("roots - couldn't save message, so not sending it", msgJson)
            }
        } catch (error: any) {
            console.error("roots - Could not save message for rel", relDisplay.id, "w/msg", msgText, "to chat", chat.id, error, error.stack)
            return;
        }
    } else {
        console.error("roots - Unable to send message, contact not found", contactAlias)
    }
}

export async function processCredentialResponse(chat: models.chat, reply: Reply): Promise<boolean> {
    let res = false;
    logger("roots - quick reply credential", chat.id, reply)
    const credReqAlias = getCredRequestAlias(reply.messageId)
    logger("roots - got credential request", credReqAlias)
    const replyJson = JSON.stringify(reply)
    //TODO should we allow updates to previous credRequest response?
    logger("roots - updating cred req", replyJson)
    const status = await store.updateItem(credReqAlias, replyJson)
    if (!status) {
        console.error("roots - Could not save credential request for", credReqAlias)
    } else {
        if (reply.value.endsWith(CRED_ACCEPTED)) {
            logger("roots - quick reply credential accepted", credReqAlias)
            const msg = getMessageById(reply.messageId)
            if (msg) {
                startProcessing(chat.id, reply.messageId)
                try {
                    const credHash = msg.data
                    logger("creds - adding imported credential", credHash)
                    const iCredJson = store.getItem(credHash);
                    logger("creds - adding import credential found in storage", iCredJson)
                    if (iCredJson) {
                        console.log("creds - parsing added imported cred json", iCredJson)
                        const iCred = JSON.parse(iCredJson)
                        const wal = wallet.getWallet()
                        if (wal) {
                            const success = await cred.addImportedCredential(iCred, wal)
                            if (success) {
                                logger("roots - accepted credential w/hash", credHash)
                                const credOwnMsg = await sendMessage(chat, "Credential accepted.",
                                    MessageType.PROMPT_OWN_CREDENTIAL, contact.ROOTS_BOT, false, credHash)
                                if (chat.id !== contact.getUserId()) {
                                    await sendMessage(getChatItem(contact.getUserId()), "You accepted a credential from " +
                                        chat.id, MessageType.PROMPT_OWN_CREDENTIAL, contact.ROOTS_BOT, false, credHash)
                                }
                            }
                        } else {
                            console.error("Couldn't get wallet", wallet.getWalletName(), wal)
                        }
                        res = credHash;
                    } else {
                        console.error("creds - Credential not found in storage", credHash)
                    }
                } catch(error: any) {
                    console.error("creds - Unable to finish accepting credential",error,error.stack)
                }
            } else {
                console.error("Could not find message for reply", reply.messageId)
            }
        } else if (reply.value.endsWith(CRED_REJECTED)) {
            logger("roots - quick reply credential rejected", credReqAlias)
            res = true
        } else {
            logger("roots - unknown credential prompt reply", credReqAlias, replyJson)
        }
    }
    endProcessing(chat.id, reply.messageId)
    return res
}

//TODO use workflow instead of hardcoding it here
export async function processPublishResponse(chat: models.chat): Promise<models.chat> {
    logger("roots - started publish DID alias", chat.fromAlias)
    try {
        startProcessing(chat.id, chat.fromAlias)
        const published = await publishPrismDid(chat.fromAlias);
        if (published) {
            const pubDid = getDid(chat.fromAlias)
            if (pubDid) {
                const didPubTx = getDidPubTx(pubDid.alias)
                const didPubMsg = await sendMessage(chat, PUBLISHED_TO_PRISM,
                    MessageType.PROMPT_OWN_DID, contact.PRISM_BOT,
                    false, contact.getContactByDid(pubDid.uriLongForm))
                const didLinkMsg = await sendMessage(chat, BLOCKCHAIN_URL_MSG,
                    MessageType.BLOCKCHAIN_URL, contact.PRISM_BOT,
                    false, didPubTx?.url)
                if (didLinkMsg) {
                    if (demo) {
                        logger("roots - demo celebrating did publishing credential", pubDid.uriLongForm)
                        const vcMsg = await sendMessage(chat,
                            "To celebrate your published DID, a verifiable credential is being created for you.",
                            MessageType.TEXT, contact.ROOTS_BOT)
                        if (vcMsg) {
                            const iCred = await issueDemoPublishDidCredential(chat, vcMsg.id)
                            if (iCred) {
                                const credPubTx = getCredPubTx(pubDid.alias, iCred.alias)
                                const credSuccess = await sendMessage(chat, "You have issued yourself a verifiable credential!",
                                    MessageType.PROMPT_ISSUED_CREDENTIAL, contact.ROOTS_BOT, false, iCred.credentialHash)

                                if (credSuccess) {
                                    //TODO create credential acceptance method
                                    logger("roots - demo credential issued", iCred.credentialHash)
                                    const credReqMsg = await sendMessage(chat,
                                        "Do you want to accept this verifiable credential",
                                        MessageType.PROMPT_ACCEPT_CREDENTIAL, contact.ROOTS_BOT, false, iCred.credentialHash)
                                    const credJson = JSON.stringify((iCred as models.credential))
                                    logger("roots - saving cred for acceptance", credJson)
                                    await store.saveItem(iCred.credentialHash, credJson)
                                }
                            }
                        } else {
                            console.error("roots - unable to issue cred", chat, pubDid)
                        }
                    }
                }
            } else {
                console.error("could not retrieve newly created DID", chat.fromAlias)
            }
        } else {
            logger("roots - Could not process publish DID request", chat.id)
            const credReqMsg = await sendMessage(chat,
                "DID was already added to Prism",
                MessageType.TEXT, contact.PRISM_BOT)
        }
    } catch(error: any) {
        console.error("Unable to publish DID for chat",chat.id,error,error.stack)
    }
    endProcessing(chat.id, chat.fromAlias)
    return chat;
}

// ------------------ Credentials ----------

function getCredentialAlias(msgId: string) {
    const alias = msgId.replace(models.ModelType.MESSAGE, models.ModelType.CREDENTIAL)
    logger("roots - generated credential alias", alias)
    return alias
}

function getCredPubTx(didAlias: string, credAlias: string) {
    logger("roots - getting cred pub tx", didAlias)
    const txLogs = wallet.getWallet()?.blockchainTxLogEntry
    const txName = didAlias + "/" + credAlias
    logger("roots - got tx logs", txLogs, "searching for", txName)
    const credPubTxLog = txLogs?.find(txLog => (txLog.action === models.CRED_ISSUE_TX && txLog.description === txName))
    logger("roots - got cred publish tx log", credPubTxLog)
    return credPubTxLog;
}

function getCredRequestAlias(msgId: string) {
    return msgId.replace(models.ModelType.MESSAGE, models.ModelType.CRED_REQUEST)
}

export async function processIssueCredential(iCred: models.issuedCredential, chat: models.chat): Promise<models.issuedCredential | undefined> {
    console.log("roots - processing issuing credential", JSON.stringify(iCred))
    const credAlias = iCred.alias
    let res;
    startProcessing(chat.id, credAlias)
    try {
        const wal = wallet.getWallet()
        if (wal) {
            const newWal = await cred.issueCredential(chat.fromAlias, iCred, wal)
            logger("roots - issued cred", newWal)
            if (newWal) {
                const newWalJson = JSON.stringify(newWal)
                const savedWal = await wallet.updateWallet(wal._id, wal.passphrase, newWalJson)
                if (savedWal) {
                    logger("roots - Added issued credential to wallet", newWalJson)
                    const credPubTx = getCredPubTx(iCred.issuingDidAlias, iCred.alias)
                    const credLinkMsg = await sendMessage(chat, BLOCKCHAIN_URL_MSG,
                        MessageType.BLOCKCHAIN_URL, contact.PRISM_BOT, false, credPubTx?.url)
                    res = cred.getIssuedCredByAlias(credAlias, newWal)
                } else {
                    console.error("Could not save issued credential, unable to save wallet", credAlias)
                }
            } else {
                console.error("Could not import accepted credential", credAlias)
            }
        } else {
            console.error("Could not get wallet", wallet.getWalletName(), wal)
        }
    }catch(error: any) {
        console.error("Error while processing issue credential",error,error.stack)
    }

    endProcessing(chat.id, credAlias)
    hasNewCred()
    return res
}

export function processViewCredential(msgId: string): models.credential | undefined {
    const msg = getMessageById(msgId)
    if (msg) {
        const credHash = msg.data
        const wal = wallet.getWallet()
        if (wal) {
            const iCred = cred.getCredByHash(credHash, wal)
            if (iCred) {
                const vCred = iCred
                return vCred;
            } else {
                console.error("Could not view credential, not found", credHash, wallet.getWalletJson(wal._id))
            }
        } else {
            console.error("Couldn't get wallet", wallet.getWalletName(), wal)
        }
    } else {
        console.error("could not process view credential, message not found", msgId)
    }
}

export async function processRevokeCredential(chat: models.chat, reply: Reply): Promise<models.issuedCredential | undefined>{
    let res;
    const msg = getMessageById(reply.messageId)
    if (msg) {
        const credHash = msg.data
        startProcessing(chat.id, credHash + CRED_REVOKE)
        try {
            logger("roots - revoking credential with hash", credHash)
            const wal = wallet.getWallet()
            if (wal) {
                const newWal = await cred.revokeCredentialByHash(credHash, wal)
                if (newWal) {
                    const newWalJson = JSON.stringify(newWal)
                    logger("roots - cred revoke result", newWalJson)
                    const savedWal = await wallet.updateWallet(newWal._id, newWal.passphrase, newWalJson)
                    if (savedWal) {
                        const iCred = cred.getIssuedCredByHash(credHash, newWal)
                        if (iCred) {
                            logger("roots - Revoked credential", iCred.alias)
                            const credRevokedMsg = await sendMessage(chat, "Credential is revoked.",
                                MessageType.TEXT, contact.ROOTS_BOT, false, credHash)
                            res = iCred;
                        }
                    } else {
                        console.error("Could not revoke credential, unable to save wallet", newWalJson)
                    }
                } else {
                    console.log("roots - could not revoke credential", credHash)
                    const credRevokedMsg = await sendMessage(chat, "Could not revoke credential " + credHash,
                        MessageType.TEXT, contact.ROOTS_BOT, false, credHash)
                }
            } else {
                console.error("Could not get wallet", wallet.getWalletName(), wal)
            }
        }catch(error: any) {
            console.error("Error while processing revoke credential",error,error.stack)
        }
        endProcessing(chat.id, credHash + CRED_REVOKE)
    } else {
        console.error("Could not revoke credential, msg not found", reply.messageId)
    }
    return res;
}

export async function processVerifyCredential(chat: models.chat, credHash: string): Promise<void> {
    startProcessing(chat.id, credHash + CRED_VERIFY)
    try {
        const wal = wallet.getWallet()
        if (wal) {
            const verify = await cred.verifyCredentialByHash(credHash, wal)
            if (verify) {
                const vDate = Date.now()
                logger("roots - verification result", verify, vDate)
                const verResult = JSON.parse(verify)
                if (verResult && verResult.length <= 0) {
                    console.log("roots - credential verification result", verResult)
                    const credVerifiedMsg = await sendMessage(chat, "Credential is valid.",
                        MessageType.TEXT, contact.ROOTS_BOT, false, vDate)
                } else if (verResult.length > 0) {
                    console.log("roots - credential is invalid", verResult)
                    const credVerifiedMsg = await sendMessage(chat, "Credential is invalid w/ messages: " + verResult,
                        MessageType.TEXT, contact.ROOTS_BOT, false, vDate)
                } else {
                    console.log("roots - could not get credential verification result", verResult)
                    const credVerifiedMsg = await sendMessage(chat, "Could not verify credential at " + vDate,
                        MessageType.TEXT, contact.ROOTS_BOT)
                }
            } else {
                console.error("Couldnt verify credential", credHash)
            }
        } else {
            console.error("Could not get wallet", wallet.getWalletName(), wal)
        }
    } catch(error: any) {
        console.error("Could not verify credential",error,error.stack)
    }
    endProcessing(chat.id, credHash + CRED_VERIFY)
}

export function showCred(navigation: any, credHash: string) {
    console.log("cred - show cred", credHash)
    const wal = wallet.getWallet()
    if (wal) {
        const iCred = cred.getCredByHash(credHash, wal)
        navigation.navigate('Credential Details', {cred: iCred})
    } else {
        console.error("could not get wallet", wallet.getWalletName(), wal)
    }
}

// ------------------ Session ---------------
export function startChatSession(chatId: string, sessionInfo: models.session): models.sessionStatus {
    logger("roots - starting session w/chat", sessionInfo.chat.title);
    sessions[chatId] = sessionInfo

    return {
        succeeded: "session succeeded",
        end: "session ended",
        error: "no errors",
    };
}

//----------- Processing -------------

export function startProcessing(processGroup: string, processAlias: string) {
    logger("starting processing", processGroup, processAlias)
    if (!allProcessing[processGroup]) {
        allProcessing[processGroup] = {}
    }
    allProcessing[processGroup][processAlias] = {
        startDate: Date.now(),
        polling: setInterval(async function () {
            updateProcessIndicator(processGroup)
        }, POLL_TIME),
    }
    logger("started processing", processGroup, processAlias, allProcessing[processGroup][processAlias])
}

export function endProcessing(processGroup: string, processAlias: string) {
    logger("ending processing", processGroup, processAlias)
    if (!allProcessing[processGroup]) {
        console.error("Cannot end processing in group that does not exist", processGroup)
    } else if (!allProcessing[processGroup][processAlias]) {
        console.error("Cannot end processing of id that does not exist", processAlias)
    } else {
        logger("processing ended", processGroup, processAlias)
        clearInterval(allProcessing[processGroup][processAlias].polling)
        allProcessing[processGroup][processAlias].endDate = Date.now()
        updateProcessIndicator(processGroup)
    }
}

function isActiveProcess(processGroup: string, processAlias: string) {
    const endDate = allProcessing[processGroup][processAlias].endDate
    const isActive = (!endDate)
    logger("is process active?", processGroup, processAlias, isActive)
    return isActive
}

function getActiveProcesses(processGroup: string) {
    let allActive: process[] = []
    if (!processGroup) {
        logger("roots - getting all active processing groups")
        const allGroups = Object.keys(allProcessing)
        allGroups.forEach(group => {
            allActive.concat(getActiveProcesses(group))
        })
    } else {
        logger("roots - getting active processing for group", processGroup)
        if (allProcessing[processGroup]) {
            const allProcAliases = Object.keys(allProcessing[processGroup])
            const activeProcAliases = allProcAliases.filter(procAlias => isActiveProcess(processGroup, procAlias))
            if (activeProcAliases && activeProcAliases.length > 0) {
                const active = activeProcAliases.map(procAlias => allProcessing[processGroup][procAlias]);
                logger("roots - found active processing", JSON.stringify(active))
                allActive = allActive.concat(active)
            }
        }
    }
    logger("roots - all active processes:", allActive.length)
    return allActive
}

export function isProcessing(processGroup: string) {
    logger("roots - determining if is processing", processGroup)
    const activeProcs = getActiveProcesses(processGroup)
    let processing = false
    if (activeProcs && activeProcs.length > 0) {
        logger("roots - active processes:", JSON.stringify(activeProcs))
        processing = true;
    } else {
        logger("roots - signaling not processing")
        processing = false;
    }

    return processing;
}

export function updateProcessIndicator(processGroup: string) {
    const processing = isProcessing(processGroup)
    logger("roots - updating processing indicator", processGroup, processing)
    if (sessions[processGroup]) {
        sessions[processGroup].onProcessing(processing)
    }
}

//----------- DEMO --------------------

export async function issueDemoContactCredential(chat: models.chat, msgId: string): Promise<models.issuedCredential | undefined> {
    const today = new Date(Date.now());
    const content = {
        name: "Added new contact",
    }
    const contentJson = JSON.stringify(content)
    return issueDemoCredential(chat, msgId, contentJson)
}

export async function issueDemoCredential(chat: models.chat, msgId: string, contentJson: string): Promise<models.issuedCredential | undefined> {
    logger("roots - Trying to create demo credential for chat", chat.id, msgId)
    const msg = getMessageById(msgId)
    if (msg) {
        const credHash = msg.data
        const wal = wallet.getWallet()
        if (wal) {
            const alreadyIssued = cred.getIssuedCredByHash(credHash, wal)
            if (!alreadyIssued) {
                logger("roots - credential not found, creating....", credHash)
                const toDid = chat.toDids[0]
                console.log("roots - contact credential being issued to DID", toDid)
                const credAlias = getCredentialAlias(msgId)
                const iCred = {
                    alias: credAlias,
                    batchId: "",
                    claim: {
                        content: contentJson,
                        subjectDid: toDid,
                    },
                    credentialHash: "",
                    issuingDidAlias: chat.fromAlias,
                    operationHash: "",
                    revoked: false,
                    verifiedCredential: {
                        encodedSignedCredential: "",
                        proof: {
                            hash: "",
                            index: -1,
                            siblings: [],
                        },
                    },
                }
                try {
                    const result = await processIssueCredential(iCred, chat)
                    if(result) {
                        return result;
                    } else {
                        console.log("Unable to issue credential",chat.fromAlias,JSON.stringify(iCred))
                        const tryAgain = await sendMessage(chat, "Unable to issue credential at this time",
                            MessageType.PROMPT_RETRY_PROCESS, contact.ROOTS_BOT, false, async ()=>{await processIssueCredential(iCred, chat)})
                    }
                } catch(error: any) {
                    console.log("Unable to issue credential",chat.fromAlias,JSON.stringify(iCred))
                    const tryAgain = await sendMessage(chat, "Unable to issue credential at this time",
                        MessageType.PROMPT_RETRY_PROCESS, contact.ROOTS_BOT, false, async ()=>{await processIssueCredential(iCred, chat)})
                }
            } else {
                logger("roots - Couldn't issue demo contact credential, was the credential already found", alreadyIssued)
            }
        } else {
            console.error("could not get wallet", wallet.getWalletName(), wal)
        }
    } else {
        console.error("unable to issued demo contact credential, unable to find message", msgId)
    }
}

export async function issueDemoPublishDidCredential(chat: models.chat, msgId: string): Promise<models.issuedCredential | undefined> {
    logger("roots - Trying to create demo credential for publishing DID", chat.id, msgId)
    const credMsgs = []
    const credAlias = getCredentialAlias(msgId)
    const did = getDid(chat.fromAlias)
    if (did) {
        const didPub = isDidPublished(did)
        const wal = wallet.getWallet()
        if (wal) {
            const alreadyIssued = cred.getIssuedCredByAlias(credAlias, wal)
            if (didPub && !alreadyIssued) {
                logger("roots - Chat is published and credential not found, creating....")
                const didLong = did.uriLongForm
                logger("roots - Creating demo credential for chat", chat.id, "w/long form did", didLong)
                const today = new Date(Date.now());
                const content = {
                    name: "Prism DID publisher",
                }
                const contentJson = JSON.stringify(content)
                return issueDemoCredential(chat, msgId, contentJson)
            } else {
                logger("roots - Couldn't issue demo credential, is the chat published",
                    didPub, "was the credential already found", alreadyIssued)
            }
        } else {
            console.error("could not get wallet", wallet.getWalletName(), wal)
        }
    } else {
        console.error("roots - couldn't issue demo cred, DID not found", did)
    }
}

async function initDemoAchievements(chat: models.chat) {
    await sendMessage(chat, ACHIEVEMENT_MSG_PREFIX + "Opened RootsWallet!",
        MessageType.STATUS,
        contact.ROOTS_BOT)
    await sendMessage(chat, "{subject: you,issuer: RootsWallet,credential: Opened RootsWallet}",
        MessageType.CREDENTIAL_JSON,
        contact.ROOTS_BOT)
    await sendMessage(chat, ACHIEVEMENT_MSG_PREFIX + "Clicked Example!",
        MessageType.STATUS,
        contact.ROOTS_BOT)
    await sendMessage(chat, "{subject: you,issuer: RootsWallet,credential: Clicked Example}",
        MessageType.CREDENTIAL_JSON,
        contact.ROOTS_BOT)
}

export function isDemo() {
    return demo
}

export function setDemo(demoMode: boolean): void {
    demo = demoMode
    logger("roots - demo mode set to", demo)
}

function rootsDid(alias: string) {
    return "did:root:" + utils.replaceSpecial(alias);
}

export async function getMediatorURL(): Promise<string> {
    // return mediatorUrl if it is empty from storage
    const mediatorUrl = await AsyncStore.getItem("mediatorUrl")
    console.log("roots - mediatorUrl from storage", mediatorUrl)

// if it is empty or undefined, set it to the null
    if(!mediatorUrl) {
        console.log("roots - mediatorUrl is empty, setting to null")
        return ''
    }
    else{
        console.log(mediatorUrl)
        return mediatorUrl
    }
}

export async function setMediatorURL(url: string): Promise<void> {
    await AsyncStore.storeItem("mediatorUrl", url,true)
    logger("roots - mediator url set to", url)
}

export async function generateKeyPair() {
    let keyGenerator = Ed25519KeyPair;
    const keyPair = await keyGenerator.generate({
        secureRandom: () => randomBytes(32)
    });

    let Ed25519VerificationKey = await keyPair.export({
        type: 'Ed25519VerificationKey2018',
        privateKey: true,
        })
    

    const suite = new Ed25519Signature2018({
        key: await Ed25519VerificationKey2018.from(
            Ed25519VerificationKey
        )
        });
    return suite
   
} 
export async function creteCredential(credential: any, suite: any) {
    const signedVC = await vc.issue({credential, suite});
    return signedVC
}
export async function createJFFcredential() {
    const suite = await generateKeyPair()

    const credential = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://purl.imsglobal.org/spec/ob/v3p0/context.json"
        ],
        "id": "urn:uuid:a63a60be-f4af-491c-87fc-2c8fd3007a58",
        "type": [
          "VerifiableCredential",
          "OpenBadgeCredential"
        ],
        "name": "JFF x vc-edu PlugFest 2 Interoperability",
        "issuer": {
          "type": ["Profile"],
          "id": "did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn",
          "name": "Jobs for the Future (JFF)"
        },
        "issuanceDate": "2022-11-14T00:00:00Z",
        "credentialSubject": {
          "type": ["AchievementSubject"],
          "id": "did:key:123",
          "achievement": {
            "id": "urn:uuid:bd6d9316-f7ae-4073-a1e5-2f7f5bd22922",
            "type": ["Achievement"],
            "name": "JFF x vc-edu PlugFest 2 Interoperability",
            "description": "This credential solution supports the use of OBv3 and w3c Verifiable Credentials and is interoperable with at least two other solutions.  This was demonstrated successfully during JFF x vc-edu PlugFest 2.",
            "criteria": {
              "type": "Criteria",
              "narrative": "Solutions providers earned this badge by demonstrating interoperability between multiple providers based on the OBv3 candidate final standard, with some additional required fields. Credential issuers earning this badge successfully issued a credential into at least two wallets.  Wallet implementers earning this badge successfully displayed credentials issued by at least two different credential issuers."
            },
            "image": {
              "id":"https://w3c-ccg.github.io/vc-ed/plugfest-2-2022/images/JFF-VC-EDU-PLUGFEST2-badge-image.png",
              "type": "Image"
            }
          }
        }
      };
    const signedVC = await creteCredential(credential, suite)
    signedVC['issuer']['id']='did:web:verifiable.ink'
    signedVC['proof']['verificationMethod']='did:web:verifiable.ink#0'
    // signedVC['proof']['id']= 'did:web:verifiable.ink'
    console.log(JSON.stringify(signedVC, null, 2));
    return signedVC
}

export async function createIIWcredential(name: string) {
    const suite = await generateKeyPair()

    const credential = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/jff-vc-edu-plugfest-1-context.json",
          "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "type": [
          "VerifiableCredential",
          "OpenBadgeCredential"
        ],
        "issuer": {
          "type": "Profile",
          "id": "https://rootsid.com",
          "name": "Roots Issuer"
        },
        "kid": "did:key:3455",
        "issuanceDate": "2022-05-01T00:00:00Z",
        "credentialSubject": {
        "id": "did:key:3455",
        "name": name,
        "type": "IIW Attendee",
        "image": "https://media-exp1.licdn.com/dms/image/C510BAQEMJ0bx115X_Q/company-logo_200_200/0/1519341150268?e=1674691200&v=beta&t=es3U9GsduolTqXbL2o9bRqYrRWIahLydgQ-FKfa2Law"

        }
      };
    const signedVC = await creteCredential(credential, suite)
    console.log(JSON.stringify(signedVC, null, 2));
    const res = await verifyCredential(signedVC, suite)
    return signedVC
}

export async function verifyCredential(credential:any, suite:any) {

    const result = await vc.verifyCredential({credential, suite})
    console.log('waiiiiiiiiiiiiiiit result check proof here should be ')
    console.log(result)
    return result
}


export async function acceptIIWCredential(chat: models.chat){
    await sendMessage(chat, 'IIW credential accepted.',
    MessageType.STATUS,
    contact.ROOTS_BOT)
    return true
     
}

export async function denyIIWCredential(chat: models.chat){
    await sendMessage(chat, 'IIW credential denied.',
    MessageType.STATUS,
    contact.ROOTS_BOT)
    return true
}

export async function requestIIWCredential(chatid: string, name: string){
    let chat = getChatItem(chatid)
    //no seconds
    let date = new Date().toLocaleString('en-US', { 
                    month: 'long',
                    day: 'numeric', 
                    year: 'numeric', 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    hour12: true }
                )

    let requested_credential = {
        "credential": {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              "https://purl.imsglobal.org/spec/ob/v3p0/context.json"
            ],
            "id": "aaa:uuid:a63a60be-f4af-491c-87fc-2c8fd3007a58",
            "type": [
              "VerifiableCredential",
              "OpenBadgeCredential"
            ],
            "name": "IIW 2022 Attendance",
            "issuer": {
              "type": ["Profile"],
              "id": "did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn",
              "name": "Jobs for the Future (JFF)"
            },
            "issuanceDate": "2022-11-14T00:00:00Z",
            "credentialSubject": {
              "type": ["AchievementSubject"],
              "id": "did:key:123",
              "achievement": {
                "id": "urn:uuid:bd6d9316-f7ae-4073-a1e5-2f7f5bd22922",
                "type": ["Achievement"],
                "name": name,
                "description": "This credential solution supports DIDComm V2. ",
                "criteria": {
                  "type": "Criteria",
                  "narrative": "Today you are at IIW at "+ date
                },
                "image": {
                  "id":"https://media-exp1.licdn.com/dms/image/C510BAQEMJ0bx115X_Q/company-logo_200_200/0/1519341150268?e=1674691200&v=beta&t=es3U9GsduolTqXbL2o9bRqYrRWIahLydgQ-FKfa2Law",
                  "type": "Image"
                }
              }
            }
          }
    }
    
//console.log date with the following format July, 4th 2021, 3:25:50 pm

    console.log(chat.fromDids[0],chat.toDids[0],'CREDDD IDDSS')
    let _mediator_cred = await credentialRequest(chat.fromDids[0],chat.toDids[0], requested_credential)
    return _mediator_cred
    
}


export async function requestAP2Credential(chatid: string, credentialOffered: any){
    let chat = getChatItem(chatid)    
    await credentialPrism2Request(chat.fromDids[0],chat.toDids[0], credentialOffered.thid)
    
}
