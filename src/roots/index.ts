import * as cred from '../credentials'
import * as models from '../models'
import {logger} from '../logging'
import {PrismModule} from '../prism'
import * as contact from '../relationships'
import {QuickReplies, Reply} from 'react-native-gifted-chat';
import * as store from '../store'
import {replaceSpecial} from '../utils'
import * as wallet from '../wallet'
import {chat, credential, issuedCredential, message, sessionStatus} from "../models";
import {addImportedCredential, getCredByHash, getCredDetails, getIssuedCredByHash} from "../credentials";
import {hasNewRels} from "../relationships";

//ppp-node-test
export const DEFAULT_PRISM_HOST = "ppp.atalaprism.io"

//msg types
export enum MessageType {
    BLOCKCHAIN_URL = "blockchainUrlMsgType",
    CREDENTIAL_JSON = "jsonCredential",
    DID_JSON = "jsonDid",
    DID = "didMsgType",
    PENDING_STATUS_MESSAGE = "rootsPendingStatus",
    PROMPT_ACCEPT_CREDENTIAL = "rootsAcceptCredentialMsgType",
    PROMPT_OWN_CREDENTIAL = "rootsOwnCredentialMsgType",
    PROMPT_OWN_DID = "rootsOwnDidMsgType",
    PROMPT_PUBLISH = "rootsPromptPublishMsgType",
    PROMPT_ISSUED_CREDENTIAL = "rootsIssuedCredentialMsgType",
    QR_CODE = "rootsQRCodeMsgType",
    STATUS = "statusMsgType",
    TEXT = "textMsgType",
    LINK = "linkMsgType",
}

//meaningful literals
export const ACHIEVEMENT_MSG_PREFIX = "You have a new achievement: ";
export const BLOCKCHAIN_URL_MSG = "*Click to geek out on Cardano blockchain details*";
export const PUBLISHED_TO_PRISM = "Your DID was added to Prism";
export const SHOW_CRED_QR_CODE = "Show Cred QR code";
export const SHOW_DID_QR_CODE = "Show Chat QR code";

//state literals
export const CRED_ACCEPTED = "credAccepted"
export const CRED_REJECTED = "credRejected"
export const CRED_REVOKE = "credRevoke"
export const CRED_SENT = "credSent"
export const CRED_VERIFY = "credVerify"
export const CRED_VIEW = "credView"
export const PUBLISH_DID = "publishDID"
export const DO_NOT_PUBLISH_DID = "doNotPublishDID"

const allChatsRegex = new RegExp(models.getStorageKey("", models.ModelType.CHAT) + '*')
const allCredsRegex = new RegExp(models.getStorageKey("", models.ModelType.CREDENTIAL) + '*')
const allCredReqsRegex = new RegExp(models.getStorageKey("", models.ModelType.CRED_REQUEST) + '*')
const allMsgsRegex = new RegExp(models.getStorageKey("", models.ModelType.MESSAGE) + '*')
const allSettingsRegex = new RegExp(models.getStorageKey("", models.ModelType.SETTING) + '*')

export const TEST_WALLET_NAME = "Catalyst Fund 7 demo wallet"

export const POLL_TIME = 2000

const demo = true;

type process = {
    endDate?: number,
    polling: NodeJS.Timer,
    startDate: number,
}

const allProcessing: { [processGroup: string]: { [processAlias: string]: process } } = {};
const sessions: { [chatId: string]: models.session } = {};

export async function initRootsWallet() {
    logger("roots - initializing RootsWallet")

    logger("roots - initializing your Did")
    const createdDid = await createDid(contact.YOU_ALIAS)

    if (createdDid) {
        const didAlias = createdDid.alias

        logger("roots - initializing your narrator bots roots")
        const prism = await initRoot(contact.PRISM_BOT, didAlias, rootsDid(contact.PRISM_BOT), contact.PRISM_BOT, contact.prismLogo)
        const rw = await initRoot(contact.ROOTS_BOT, didAlias, rootsDid(contact.ROOTS_BOT), contact.ROOTS_BOT, contact.rootsLogo)

        logger("roots - initializing your root")
        const relCreated = await initRoot(contact.YOU_ALIAS, didAlias, createdDid.uriLongForm, contact.YOU_ALIAS, contact.catalystLogo);
        logger("roots - initialized your root", relCreated)
        const myRel = contact.getContactByAlias(contact.YOU_ALIAS)

        logger("roots - posting your personal initialization messages")
        const myChat = getChatItem(contact.YOU_ALIAS)
        const welcomeAchMsg = await sendMessage(myChat,
            "Welcome to your personal RootsWallet history!",
            MessageType.TEXT, contact.ROOTS_BOT)
        const achMsg = await sendMessage(myChat,
            "We'll post new wallet events here.",
            MessageType.TEXT, contact.ROOTS_BOT)
        const createdWalletMsg = await sendMessage(myChat,
            "You created your wallet: " + wallet.getWallet(TEST_WALLET_NAME)?._id, MessageType.TEXT, contact.ROOTS_BOT)
        const createdDidMsg = await sendMessage(myChat,
            "You created your first decentralized ID (called a DID)!",
            MessageType.TEXT, contact.ROOTS_BOT)
        await sendMessage(myChat, "Your new DID is being added to Prism so that you can receive verifiable credentials (called VCs) from other users and organizations like Catalyst, your school, rental companies, etc.",
            MessageType.TEXT, contact.PRISM_BOT)
        //intentionally not awaiting
        processPublishResponse(myChat)

        // if (demo) {
        //     logger("roots - initializing your demos")
        //     await initDemos(didAlias)
        // }
    }
}

export async function loadAll(walName: string, walPass: string) {
    const wal = await wallet.loadWallet(walName, walPass);
    if (wal) {
        const chats = await loadItems(allChatsRegex)
        const rels = await loadItems(contact.allRelsRegex);
        const messages = await loadItems(allMsgsRegex);
        const credRequests = await loadItems(allCredReqsRegex);
        const creds = await loadItems(allCredsRegex);
        if (wal && chats && rels && messages && credRequests) {
            return wal
        } else {
            logger("Failed to load all items")
            return;
        }
    } else {
        logger("Failed to load wallet")
        return;
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
    } catch (error) {
        console.error("roots - Failed to load items w/regex", regex, error, error.stack)
        return false;
    }
}

export async function storageStatus() {
    logger("roots - Getting storage status")
    await store.status();
}

export async function handleNewData(jsonData: string): Promise<boolean | undefined> {
    const obj = JSON.parse(jsonData)
    if ((obj as models.credential).verifiedCredential) {
        console.log("roots - handling scanned cred", jsonData)
        const wal = wallet.getWallet(TEST_WALLET_NAME)
        if(wal) {
            await addImportedCredential(obj,wal)
            return true
        } else {
            console.error("roots - Wallet not found")
        }
    } else if ((obj as models.contact).displayName) {
        console.log("handling scanned rel", jsonData)
        await initRoot(obj.displayName, contact.YOU_ALIAS, obj.did, obj.displayName, obj.displayPictureUrl)
        //intentionally not awaiting
        hasNewContact((obj as models.contact))
    } else {
        console.error("roots - Did not recognize scanned data", jsonData)
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
export async function initRoot(alias: string, fromDidAlias: string, toDid: string, display = alias, avatar = contact.personLogo) {
    logger("roots - creating root", alias, fromDidAlias, toDid, display, avatar)
    try {
        const relCreated = await contact.createRelItem(alias, display, avatar, toDid);
        logger("roots - rel created/existed?", relCreated)
        const con = contact.getContactByAlias(alias)
        logger("roots - getting rel DID document")
        if (con && alias !== contact.PRISM_BOT && alias !== contact.ROOTS_BOT) {
            logger("roots - creating chat for rel", con.id)
            const chat = await createChat(alias, fromDidAlias, toDid, display)
            //not awaiting on purpose
            if(chat) {
                //TODO what should a new chat trigger?
                //hasNewChat(getChatItem(alias));
            }
        }
        //intentionally not awaiting
        hasNewRels()
        return true;
    } catch (error) {
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
            logger("roots - Chat/DID already exists", didAlias)
            return existingDid;
        } else {
            logger("roots - DID does not exist, creating", didAlias, "DID")
            const wal = wallet.getWallet(TEST_WALLET_NAME)
            if(wal) {
                const walletJson = wallet.getWalletJson(wal._id)
                logger("roots - requesting chat/did from prism, w/wallet", walletJson)
                const prismWalletJson = PrismModule.newDID(walletJson, didAlias)
                logger("roots - Chat/prismDid added to wallet", prismWalletJson)
                const saveResult = await wallet.updateWallet(wal._id, wal.passphrase, prismWalletJson)
                if (saveResult) {
                    const newDid = getDid(didAlias)
                    logger("roots - did added to wallet", newDid)
                    return newDid;
                } else {
                    console.error("roots - could not save wallet with new DID", prismWalletJson)
                }
            } else {
                console.error("roots - Wallet no found",wal)
            }
        }
    } catch (error) {
        console.error("Failed to create chat DID", error, error.stack)
        return;
    }
}

export function getDid(didAlias: string): models.did | undefined {
    logger("roots - getDid by alias", didAlias)
    const dids = wallet.getWallet(TEST_WALLET_NAME)?.dids;
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
    const txLogs = wallet.getWallet(TEST_WALLET_NAME)?.blockchainTxLogEntry
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
                const wal = wallet.getWallet(TEST_WALLET_NAME)
                if(wal) {
                    const newWalJson = await PrismModule.publishDid(wallet.getWalletJson(wal._id), did.alias)
                    const result = await wallet.updateWallet(wal._id, wal.passphrase, newWalJson)
                    const pubDid = getDid(didAlias)
                    if (pubDid) {
                        return isDidPublished(pubDid)
                    } else {
                        console.error("roots - DID was NOT published", newWalJson)
                    }
                }
            } catch (error) {
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
export async function createChat(alias: string, fromDidAlias: string, toDid: string, title = "Untitled") {
    logger("roots - Creating chat", alias, "for toDid", toDid, "and fromDidAlias", fromDidAlias, "w/ title", title)
    const chatItemCreated = await createChatItem(alias, fromDidAlias, toDid, title)
    logger("roots - chat item created/existed?", chatItemCreated)
    const chatItem = getChatItem(alias)
    logger("roots - chat item", chatItem)

    if (chatItemCreated && chatItem) {
        logger("Created chat and added welcome to chat", chatItem.title)
        if (!(alias === contact.YOU_ALIAS)) {
            const chMsg = await sendMessage(chatItem,
                "You are now in contact with " + alias,
                MessageType.TEXT, contact.ROOTS_BOT)
            const statusMsg = await sendMessage(getChatItem(contact.YOU_ALIAS),
                "New contact added: " + alias,
                MessageType.TEXT, contact.ROOTS_BOT)
        }
        return true;
    } else {
        console.error("Could not create chat", fromDidAlias, toDid, title);
        return false
    }
}

async function createChatItem(chatAlias: string, fromDidAlias: string, toDid: string, title = chatAlias) {
    logger('roots - Creating a new chat item', chatAlias)
    if (getChatItem(chatAlias)) {
        logger('roots - chat item already exists', chatAlias)
        return true
    } else {
        const chatItem = models.createChat(chatAlias, fromDidAlias, [toDid], title)
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

export async function getChatByRel(rel: models.contact) {
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
function getChatItems() {
    logger("roots - getting chat items")
    const chatItemJsonArray = store.getItems(allChatsRegex)
    logger("roots - got chat items", String(chatItemJsonArray))
    const chats = chatItemJsonArray.map(chatItemJson => JSON.parse(chatItemJson))
    return chats;
}

export async function hasNewContact(rel: models.contact) {
    if(isDemo()) {
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
    if (msg.type === MessageType.PROMPT_OWN_DID) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: 'Show QR code',
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
    return msg
}

function addMessageExtensions(msg: models.message) {
    msg = addQuickReply(msg)
    return msg
}

export function getMessagesByChat(chatAlias: string): message[] {
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

export function getMessageById(msgId: string): message | undefined {
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
    const msgRegex = new RegExp(models.ModelType.MESSAGE + '_' + replaceSpecial(relId) + '*')
    const msgItemJsonArray = store.getItems(msgRegex)
    logger("roots - got user msg items", msgItemJsonArray.length)
    const chatMsgs = msgItemJsonArray.map(
        (msgItemJson) => {
            logger("parsing msg json", msgItemJson)
            return JSON.parse(msgItemJson);
        }
    )
    chatMsgs.sort((a, b) => (a.createdTime < b.createdTime) ? -1 : 1)
    return chatMsgs;
}

export async function sendMessages(chat: models.chat, msgs: string[], msgType: MessageType, contactAlias: string) {
    msgs.map(async (msg) => await sendMessage(chat, msg, msgType, contactAlias))
}

//TODO unify aliases and storageKeys?
export async function sendMessage(chat: models.chat, msgText: string, msgType: MessageType, contactAlias: string, system = false, data = {}) {
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
            if(result) {
                if (sessions[chat.id]) {
                    logger("roots - sending message to onReceivedMessage", chat.id, msgJson)
                    sessions[chat.id].onReceivedMessage(msg)
                } else {
                    console.log("roots - no session yet for", chat.id)
                }
                logger("roots - Sent/Stored message", msgJson)
                return msg
            } else {
                console.error("roots - couldn't save message, so not sending it",msgJson)
            }
        } catch (error) {
            console.error("roots - Could not save message for rel", relDisplay.id, "w/msg", msgText, "to chat", chat.id, error, error.stack)
            return;
        }
    } else {
        console.error("roots - Unable to send message, contact not found", contactAlias)
    }
}

export async function processCredentialResponse(chat: models.chat, reply: Reply) {
    logger("roots - quick reply credential", chat.id, reply)
    const credReqAlias = getCredRequestAlias(reply.messageId)
    logger("roots - got credential request", credReqAlias)
    const replyJson = JSON.stringify(reply)
    //TODO should we allow updates to previous credRequest response?
    logger("roots - updating cred req", replyJson)
    const status = await store.updateItem(credReqAlias, replyJson)
    if (!status) {
        console.error("roots - Could not save credential request for", credReqAlias)
        return false;
    } else {
        if (reply.value.endsWith(CRED_ACCEPTED)) {
            logger("roots - quick reply credential accepted", credReqAlias)
            const msg = getMessageById(reply.messageId)
            if (msg) {
                startProcessing(chat.id, reply.messageId)
                const credHash = msg.data
                logger("creds - adding imported credential", credHash)
                const iCredJson = store.getItem(credHash);
                logger("creds - adding import credential found in storage", iCredJson)
                if (iCredJson) {
                    console.log("creds - parsing added imported cred json", iCredJson)
                    const iCred = JSON.parse(iCredJson)
                    const wal = wallet.getWallet(TEST_WALLET_NAME)
                    if(wal) {
                        const success = await cred.addImportedCredential(iCred, wal)
                        if (success) {
                            logger("roots - accepted credential w/hash", credHash)
                            const credOwnMsg = await sendMessage(chat, "Credential accepted.",
                                MessageType.PROMPT_OWN_CREDENTIAL, contact.ROOTS_BOT, false, credHash)
                            if (!(chat.id === contact.YOU_ALIAS)) {
                                await sendMessage(getChatItem(contact.YOU_ALIAS), "You accepted a credential from " +
                                    chat.id, MessageType.PROMPT_OWN_CREDENTIAL, contact.ROOTS_BOT, false, credHash)
                            }
                        }
                    } else {
                        console.error("Couldn't get wallet",TEST_WALLET_NAME,wal)
                    }
                    endProcessing(chat.id, reply.messageId)
                    return credHash;
                } else {
                    console.error("creds - Credential not found in storage", credHash)
                }
            } else {
                console.error("Could not find message for reply", reply.messageId)
            }
        } else if (reply.value.endsWith(CRED_REJECTED)) {
            logger("roots - quick reply credential rejected", credReqAlias)
            return true
        } else {
            logger("roots - unknown credential prompt reply", credReqAlias, replyJson)
            return false
        }
    }
}

//TODO use workflow instead of hardcoding it here
export async function processPublishResponse(chat: models.chat) {
    logger("roots - started publish DID alias", chat.fromAlias)
    startProcessing(chat.id, chat.fromAlias)
    const published = await publishPrismDid(chat.fromAlias);
    if (published) {
        endProcessing(chat.id, chat.fromAlias)
        const pubDid = getDid(chat.fromAlias)
        if (pubDid) {
            const didPubTx = getDidPubTx(pubDid.alias)
            const didPubMsg = await sendMessage(chat, PUBLISHED_TO_PRISM,
                MessageType.PROMPT_OWN_DID, contact.PRISM_BOT,
                false, pubDid.uriLongForm)
            const didLinkMsg = await sendMessage(chat, BLOCKCHAIN_URL_MSG,
                MessageType.BLOCKCHAIN_URL, contact.PRISM_BOT,
                false, didPubTx?.url)
            if (didLinkMsg) {
                //const didMsg = await sendMessage(chat,JSON.stringify(pubDid),DID_JSON,rel.PRISM_BOT,true);
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
            return chat
        } else {
            console.error("could not retrieve newly created DID", chat.fromAlias)
        }
    } else {
        logger("roots - Could not process publish DID request", chat.id)
        const credReqMsg = await sendMessage(chat,
            "DID was already added to Prism",
            MessageType.TEXT, contact.PRISM_BOT)
        return chat;
    }
}

// ------------------ Credentials ----------

function getCredentialAlias(msgId: string) {
    const alias = msgId.replace(models.ModelType.MESSAGE, models.ModelType.CREDENTIAL)
    logger("roots - generated credential alias", alias)
    return alias
}

function getCredPubTx(didAlias: string, credAlias: string) {
    logger("roots - getting cred pub tx", didAlias)
    const txLogs = wallet.getWallet(TEST_WALLET_NAME)?.blockchainTxLogEntry
    const txName = didAlias + "/" + credAlias
    logger("roots - got tx logs", txLogs, "searching for", txName)
    const credPubTxLog = txLogs?.find(txLog => (txLog.action === models.CRED_ISSUE_TX && txLog.description === txName))
    logger("roots - got cred publish tx log", credPubTxLog)
    return credPubTxLog;
}

function getCredRequestAlias(msgId: string) {
    return msgId.replace(models.ModelType.MESSAGE, models.ModelType.CRED_REQUEST)
}

export async function processIssueCredential(iCred: models.issuedCredential, chat: models.chat) {
    console.log("roots - processing issuing credential", JSON.stringify(iCred))
    const credAlias = iCred.alias
    startProcessing(chat.id, credAlias)
    const wal = wallet.getWallet(TEST_WALLET_NAME)
    if(wal) {
        const newWal = await cred.issueCredential(chat.fromAlias, iCred, wal)
        logger("roots - issued cred", newWal)
        if (newWal) {
            const newWalJson = JSON.stringify(newWal)
            const savedWal = await wallet.updateWallet(wal._id, wal.passphrase, newWalJson)
            if (savedWal) {
                logger("roots - Added issued credential to wallet", newWalJson)
                endProcessing(chat.id, credAlias)
                const credPubTx = getCredPubTx(iCred.issuingDidAlias, iCred.alias)
                const credLinkMsg = await sendMessage(chat, BLOCKCHAIN_URL_MSG,
                    MessageType.BLOCKCHAIN_URL, contact.PRISM_BOT, false, credPubTx?.url)
                return cred.getIssuedCredByAlias(credAlias, newWal)
            } else {
                console.error("Could not save issued credential, unable to save wallet", credAlias)
            }
        } else {
            console.error("Could not import accepted credential", credAlias)
        }
    } else {
        console.error("Could not get wallet",TEST_WALLET_NAME,wal)
    }
    endProcessing(chat.id, credAlias)
}

export function processViewCredential(msgId: string): models.credential | undefined {
    const msg = getMessageById(msgId)
    if (msg) {
        const credHash = msg.data
        const wal = wallet.getWallet(TEST_WALLET_NAME)
        if(wal) {
            const iCred = cred.getCredByHash(credHash, wal)
            if (iCred) {
                const vCred = iCred
                return vCred;
            } else {
                console.error("Could not view credential, not found", credHash, wallet.getWalletJson(wal._id))
            }
        } else {
            console.error("Couldn't get wallet",TEST_WALLET_NAME,wal)
        }
    } else {
        console.error("could not process view credential, message not found", msgId)
    }
}

export async function processRevokeCredential(chat: models.chat, reply: Reply) {
    const msg = getMessageById(reply.messageId)
    if (msg) {
        const credHash = msg.data
        startProcessing(chat.id, credHash + CRED_REVOKE)
        logger("roots - revoking credential with hash", credHash)
        const wal = wallet.getWallet(TEST_WALLET_NAME)
        if(wal) {
            const newWal = await cred.revokeCredentialByHash(credHash, wal)
            if (newWal) {
                const newWalJson = JSON.stringify(newWal)
                logger("roots - cred revoke result", newWalJson)
                const savedWal = await wallet.updateWallet(newWal._id, newWal.passphrase, newWalJson)
                endProcessing(chat.id, credHash + CRED_REVOKE)
                if (savedWal) {
                    const iCred = getIssuedCredByHash(credHash, newWal)
                    if (iCred) {
                        logger("roots - Revoked credential", iCred.alias)
                        const credRevokedMsg = await sendMessage(chat, "Credential is revoked.",
                            MessageType.TEXT, contact.ROOTS_BOT, false, credHash)
                        return iCred;
                    }
                } else {
                    console.error("Could not revoke credential, unable to save wallet", newWalJson)
                    return
                }
            } else {
                endProcessing(chat.id, credHash + CRED_REVOKE)
                console.log("roots - could not revoke credential", credHash)
                const credRevokedMsg = await sendMessage(chat, "Could not revoke credential " + credHash,
                    MessageType.TEXT, contact.ROOTS_BOT, false, credHash)
            }
        } else {
            console.error("Could not get wallet",TEST_WALLET_NAME,wal)
        }
    } else {
        console.error("Could not revoke credential, msg not found", reply.messageId)
    }
}

export async function processVerifyCredential(chat: models.chat, credHash: string) {
    startProcessing(chat.id, credHash + CRED_VERIFY)
    const wal = wallet.getWallet(TEST_WALLET_NAME)
    if(wal) {
        const verify = await cred.verifyCredentialByHash(credHash, wal)
        if (verify) {
            const vDate = Date.now()
            logger("roots - verification result", verify, vDate)
            const verResult = JSON.parse(verify)
            if (verResult && verResult.length <= 0) {
                endProcessing(chat.id, credHash + CRED_VERIFY)
                console.log("roots - credential verification result", verResult)
                const credVerifiedMsg = await sendMessage(chat, "Credential is valid.",
                    MessageType.TEXT, contact.ROOTS_BOT, false, vDate)
            } else if (verResult.length > 0) {
                endProcessing(chat.id, credHash + CRED_VERIFY)
                console.log("roots - credential is invalid", verResult)
                const credVerifiedMsg = await sendMessage(chat, "Credential is invalid w/ messages: " + verResult,
                    MessageType.TEXT, contact.ROOTS_BOT, false, vDate)
            } else {
                endProcessing(chat.id, credHash + CRED_VERIFY)
                console.log("roots - could not get credential verification result", verResult)
                const credVerifiedMsg = await sendMessage(chat, "Could not verify credential at " + vDate,
                    MessageType.TEXT, contact.ROOTS_BOT)
            }
        } else {
            console.error("Couldnt verify credential", credHash)
        }
    } else {
        console.error("Could not get wallet",TEST_WALLET_NAME,wal)
    }
}

export function showCred(navigation: any, credHash: string) {
    console.log("cred - show cred", credHash)
    const wal = wallet.getWallet(TEST_WALLET_NAME)
    if(wal) {
        const iCred = cred.getCredByHash(credHash,wal)
        if (iCred) {
            const credDetails = getCredDetails(iCred.verifiedCredential)
            navigation.navigate('Credential Details', {cred: credDetails})
        } else {
            console.error("Cannot show cred, cred not found", credHash)
        }
    } else {
        console.error("could not get wallet",TEST_WALLET_NAME,wal)
    }
}

// ------------------ Session ---------------
export function startChatSession(chatId: string, sessionInfo: models.session): sessionStatus {
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

export async function issueDemoContactCredential(chat: models.chat, msgId: string): Promise<issuedCredential | undefined> {
    const today = new Date(Date.now());
    const content = {
        name: "Added new contact",
        achievement: "You added a new contact " + chat.id,
        date: today.toISOString(),
    }
    const contentJson = JSON.stringify(content)
    return issueDemoCredential(chat, msgId, contentJson)
}

export async function issueDemoCredential(chat: models.chat, msgId: string, contentJson: string): Promise<issuedCredential | undefined> {
    logger("roots - Trying to create demo credential for chat", chat.id, msgId)
    const msg = getMessageById(msgId)
    if (msg) {
        const credHash = msg.data
        const wal = wallet.getWallet(TEST_WALLET_NAME)
        if(wal) {
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
                const result = await processIssueCredential(iCred, chat)
                return result;
            } else {
                logger("roots - Couldn't issue demo contact credential, was the credential already found", alreadyIssued)
            }
        } else {
            console.error("could not get wallet",TEST_WALLET_NAME,wal)
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
        const wal = wallet.getWallet(TEST_WALLET_NAME)
        if(wal) {
            const alreadyIssued = cred.getIssuedCredByAlias(credAlias, wal)
            if (didPub && !alreadyIssued) {
                logger("roots - Chat is published and credential not found, creating....")
                const didLong = did.uriLongForm
                logger("roots - Creating demo credential for chat", chat.id, "w/long form did", didLong)
                const today = new Date(Date.now());
                const content = {
                    name: "Prism DID publisher",
                    achievement: "Published a DID to Cardano - Atala Prism",
                    date: today.toISOString(),
                }
                const contentJson = JSON.stringify(content)
                return issueDemoCredential(chat, msgId, contentJson)
            } else {
                logger("roots - Couldn't issue demo credential, is the chat published",
                    didPub, "was the credential already found", alreadyIssued)
            }
        } else {
            console.error("could not get wallet",TEST_WALLET_NAME,wal)
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

function rootsDid(alias: string) {
    return "did:root:" + replaceSpecial(alias);
}