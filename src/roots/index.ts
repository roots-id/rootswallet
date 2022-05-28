import * as cred from '../credentials'
import * as models from '../models'
import { logger } from '../logging'
import { PrismModule } from '../prism'
import * as rel from '../relationships'
import * as walletSchema from '../schemas/WalletSchema'
import { QuickReplies, Reply } from 'react-native-gifted-chat';
import * as store from '../store'
import { replaceSpecial } from '../utils'

//ppp-node-test
export const DEFAULT_PRISM_HOST = "ppp-node-test.atalaprism.io"

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

const allChatsRegex = new RegExp(models.getStorageKey("",models.ModelType.CHAT)+'*')
const allCredsRegex = new RegExp(models.getStorageKey("",models.ModelType.CREDENTIAL)+'*')
const allCredReqsRegex = new RegExp(models.getStorageKey("",models.ModelType.CRED_REQUEST)+'*')
const allMsgsRegex = new RegExp(models.getStorageKey("",models.ModelType.MESSAGE)+'*')
const allSettingsRegex = new RegExp(models.getStorageKey("",models.ModelType.SETTING)+'*')

export const TEST_WALLET_NAME = "Catalyst Fund 7 demo wallet"

export const POLL_TIME = 1000

const demo = true;

let currentWal: models.wallet;

type process = {
    endDate?: number,
    polling: NodeJS.Timer,
    startDate: number,
}
//TODO move all Processing into session
const allProcessing: {[processGroup: string]: {[processAlias: string]: process}} = {};
const sessions: {[chatId: string]: models.session} = {};

export async function initRootsWallet() {
    logger("roots - initializing RootsWallet")

    logger("roots - initializing your Did")
    const createdDid = await createDid(rel.YOU_ALIAS)

    if(createdDid) {
        const didAlias = createdDid[walletSchema.DID_ALIAS]

        logger("roots - initializing your narrator bots roots")
        const prism = await initRoot(rel.PRISM_BOT, didAlias, rootsDid(rel.PRISM_BOT), rel.PRISM_BOT, rel.prismLogo)
        const rw = await initRoot(rel.ROOTS_BOT, didAlias, rootsDid(rel.ROOTS_BOT), rel.ROOTS_BOT, rel.rootsLogo)

        logger("roots - initializing your root")
        const relCreated = await initRoot(rel.YOU_ALIAS, didAlias, createdDid[walletSchema.DID_URI_LONG_FORM], rel.YOU_ALIAS, rel.catalystLogo);
        logger("roots - initialized your root", relCreated)
        const myRel = rel.getRelItem(rel.YOU_ALIAS)

        logger("roots - posting your personal initialization messages")
        const myChat = getChatItem(rel.YOU_ALIAS)
        const welcomeAchMsg = await sendMessage(myChat,
            "Welcome to your personal RootsWallet history!",
            MessageType.TEXT, rel.getRelItem(rel.ROOTS_BOT))
        const achMsg = await sendMessage(myChat,
            "We'll post new wallet events here.",
            MessageType.TEXT, rel.getRelItem(rel.ROOTS_BOT))
        const createdWalletMsg = await sendMessage(myChat,
            "You created your wallet: " + currentWal._id, MessageType.TEXT, rel.getRelItem(rel.ROOTS_BOT))
        const createdDidMsg = await sendMessage(myChat,
            "You created your first decentralized ID (called a DID)!",
            MessageType.TEXT, rel.getRelItem(rel.ROOTS_BOT))
        await sendMessage(myChat, "Your new DID is being added to Prism so that you can receive verifiable credentials (called VCs) from other users and organizations like Catalyst, your school, rental companies, etc.",
            MessageType.TEXT, rel.getRelItem(rel.PRISM_BOT))
        //intentionally not awaiting
        processPublishResponse(myChat)

        if (demo) {
            logger("roots - initializing your demos")
            await initDemos(didAlias)
        }
    }
}

export async function loadAll(walName: string,walPass: string) {
    const wallet = await loadWallet(walName, walPass);
    if(wallet) {
        const chats = await loadItems(allChatsRegex)
        const rels = await loadItems(rel.allRelsRegex);
        const messages = await loadItems(allMsgsRegex);
        const credRequests = await loadItems(allCredReqsRegex);
        const creds = await loadItems(allCredsRegex);
        if(wallet && chats && rels && messages && credRequests) {
            return wallet
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
        if(result) {
            logger("roots - successfully loaded items w/regex",regex)
            return true;
        }
        else {
            console.error("roots - Failed to load items w/regex",regex)
            return false;
        }
    } catch(error) {
        console.error("roots - Failed to load items w/regex",regex,error,error.stack)
        return false;
    }
}

export async function handleNewData(jsonData: string) {
    const obj = JSON.parse(jsonData)
    if(obj.dataType === models.ModelType.CREDENTIAL) {
        console.log("handling scanned cred",jsonData)
        return "VCs"
    } else if(obj.dataType === models.ModelType.CONTACT) {
        console.log("handling scanned rel",jsonData)
        const rooted = await initRoot(obj.displayName, rel.YOU_ALIAS, obj.did, obj.displayName, obj.displayPictureUrl)
        if(rooted) {
            const chat = await getChatByRel(obj);
            const msg = await sendMessage(chat,"To celebrate your new contact you are issuing "
             + obj.displayName + " a verifiable credential",MessageType.TEXT,rel.getRelItem(rel.ROOTS_BOT))
            if(msg && isDemo()) {
                const credIssueAlias = await issueDemoContactCredential(chat,msg.id)
                if(credIssueAlias) {
                    //const credPubTx = getCredPubTx(pubDid[walletSchema.DID_ALIAS],credIssueAlias)
                    const credSuccess = await sendMessage(chat,"You have issued "+obj.displayName+" a verifiable credential!",
                        MessageType.PROMPT_ISSUED_CREDENTIAL,rel.getRelItem(rel.ROOTS_BOT),false,credIssueAlias)
//                     const credLinkMsg = await sendMessage(chat,BLOCKCHAIN_URL_MSG,
//                         MessageType.BLOCKCHAIN_URL,rel.getRelItem(rel.PRISM_BOT),false,credPubTx.url)
                } else {
                    console.error("roots - unable to issue cred",chat,"for msg",msg.id)
                }
            }
            return "Relationships"
        } else {
            console.error("Could not root with ",obj.displayName)
            return "Relationships"
        }
    } else {
        console.error("Did not recognize scanned data",jsonData)
        return "Relationships"
    }
}

//----------------- Prism ----------------------
export function setPrismHost(host=DEFAULT_PRISM_HOST, port="50053") {
    logger("roots - setting Prism host and port",host,port)
    PrismModule.setNetwork(host,port)
    store.updateItem(getSettingAlias("prismNodePort"),port)
    store.updateItem(getSettingAlias("prismNodeHost"),host)
}

export function getPrismHost() {
    const host = store.getItem(getSettingAlias("prismNodeHost"))
    return (host) ? host :  DEFAULT_PRISM_HOST;
}

//--------------- Roots ----------------------

export async function initRoot(alias: string, fromDidAlias: string, toDid: string, display=alias, avatar=rel.personLogo) {
    logger("roots - creating root",alias,fromDidAlias,toDid,display,avatar)
    try {
        const relCreated = await rel.createRelItem(alias,display, avatar, toDid);
        logger("roots - rel created/existed?",relCreated)
        const relationship = rel.getRelItem(alias)
        logger("roots - creating chat for rel",relationship.id)
        //toDid: string, fromDidAliasAlias: string, myRel: Object, title: string
        if(alias !== rel.PRISM_BOT && alias !== rel.ROOTS_BOT) {
            const chat = await createChat(alias,fromDidAlias,toDid,display)
        }
        return true;
    } catch(error) {
        console.error("Failed to initRoot",error,error.stack)
        return false;
    }
}

//---------------- Settings -----------------------
function applyAppSettings() {
    setPrismHost(store.getItem(getSettingAlias("prismNodeHost")),
        store.getItem(getSettingAlias("prismNodePort")));
}

function getSettingAlias(key: string) {
    return models.getStorageKey(key,models.ModelType.SETTING)
}

export async function loadSettings() {
    const settings = await loadItems(allSettingsRegex)
    applyAppSettings();
    return settings;
}

//----------------- Wallet ---------------------
export async function createWallet(walName: string,mnemonic: string[],walPass: string) {
    const prismWal = PrismModule.newWal(walName,mnemonic,walPass)
    const result = await updateWallet(walName,walPass,prismWal)
    if(result) {
        logger('Wallet created',getWalletJson(currentWal._id))
        return result;
    } else {
        logger('Could not create wallet',walName,walPass)
        return result;
    }
}

export async function loadWallet(walName: string,walPass: string) {
    logger("roots - loading wallet",walName,"with walPass",walPass);
    const restored = await store.restoreWallet(walPass);
    //retrieving wallet pulls the object into memory here
    const rootsWal = getRootsWallet(walName)
    if(restored && !(!rootsWal || rootsWal == null)) {
        logger("roots - loaded wallet",walName,"with walPass",walPass);
        return true
    } else {
        console.error("could not load wallet with walPass",walPass)
        return false
    }
}

export async function storageStatus() {
    logger("roots - Getting storage status")
    await store.status();
}

export async function hasWallet(walName: string) {
    if(await store.hasWallet(walName)) {
        logger("roots - Has wallet",store.getWallet(walName));
        return true;
    }
    else{
        logger("roots - Does not have wallet",walName);
        return false;
    }
 }

export function getRootsWallet(walName: string) {
    if(!currentWal || currentWal == null) {
        logger("roots - rootsWallet not set yet");
        const storedWalJson = store.getWallet(walName);
        if(!storedWalJson || storedWalJson == null) {
            logger("roots - no rootsWallet in storage",storedWalJson);
            return currentWal;
        } else {
            logger("roots - rootsWallet from storage",storedWalJson);
            currentWal = JSON.parse(storedWalJson);
            return currentWal;
        }
    } else {
        logger("roots - getRootsWallet has wallet",currentWal);
        return currentWal;
    }
}

export function getWalletJson(walId: string) {
    return store.getWallet(walId)
}

export async function updateWallet(walName: string, walPass: string, walJson: string) {
    if(await store.saveWallet(walName, walPass, walJson)) {
        currentWal = JSON.parse(walJson)
        logger("roots - updated roots wallet",walJson);
        return true;
    } else {
        console.error("roots - failed to update roots wallet",walJson);
        return false;
    }
}

//------------------ DIDs ----------------
async function createDid(didAlias: string) {
    try {
        const existingDid = getDid(didAlias)
        if(existingDid) {
            logger("roots - Chat/DID already exists",didAlias)
            return existingDid;
        } else {
            logger("roots - DID does not exist, creating",didAlias,"DID")
            const walletJson = getWalletJson(currentWal._id)
            logger("roots - requesting chat/did from prism, w/wallet",walletJson)
            const prismWalletJson = PrismModule.newDID(walletJson,didAlias)
            logger("roots - Chat/prismDid added to wallet", prismWalletJson)
            const saveResult = await updateWallet(currentWal._id,currentWal.passphrase,prismWalletJson)
            const newDid = getDid(didAlias)
            logger("roots - did added to wallet",newDid)
            return newDid;
        }
    } catch(error) {
        console.error("Failed to create chat DID",error,error.stack)
        return;
    }
}

export function getDid(didAlias: string) {
    logger("roots - getDid by alias",didAlias)
    const dids = currentWal[walletSchema.WALLET_DIDS];
    if(dids) {
        logger("roots - # of current dids",dids.length);
        dids.forEach(did=>logger("\tdid:",did[walletSchema.DID_ALIAS]))
        const findDid = dids.find(did => (did[walletSchema.DID_ALIAS] === didAlias));
        if(findDid) {
            logger("roots -  found did alias",didAlias,"w/keys:",Object.keys(findDid))
            return findDid
        } else {
            logger("roots - Couldn't find DID",didAlias)
            return;
        }
    } else {
        logger("roots - wallet has no DIDs to get.")
        return;
    }

}

function getDidPubTx(didAlias: string) {
    logger("roots - getting DID pub tx",didAlias)
    const txLogs = currentWal[walletSchema.WALLET_TX_LOGS]
    logger("roots - got tx logs",JSON.stringify(txLogs))
    const didPublishTxLog = txLogs?.find(txLog => (txLog.action === walletSchema.DID_PUBLISH_TX && txLog.description === didAlias))
    logger("roots - got DID publish tx log",JSON.stringify(didPublishTxLog))
    return didPublishTxLog;
}

function hasLongForm(did: models.did) {
    console.log("roots - checking DID has long form", did[walletSchema.DID_URI_LONG_FORM]);
    const hasLong = did[walletSchema.DID_URI_LONG_FORM] && did[walletSchema.DID_URI_LONG_FORM].length > 0;
    if(hasLong) {
        logger("roots - DID has long form",did[walletSchema.DID_URI_LONG_FORM]);
        return true;
    } else {
        logger("roots - DID does not have long form",did[walletSchema.DID_URI_CANONICAL_FORM]);
        return false;
    }
}

function isDidPublished(did: models.did) {
    const didAlias = did[walletSchema.DID_ALIAS]
    console.log("roots - checking DID has been published",didAlias);
    const didPubTxLog = getDidPubTx(didAlias)
    if(didPubTxLog) {
        logger("roots - DID was published",didPubTxLog)
        return true;
    } else {
        logger("roots - DID not published",didAlias)
        return false;
    }
}

export async function publishPrismDid(didAlias: string) {
    const did = getDid(didAlias)
    if(did) {
        logger("publishing DID", did[walletSchema.DID_URI_CANONICAL_FORM],
            "and long form", did[walletSchema.DID_URI_LONG_FORM])
        if (!isDidPublished(did)) {
            const longFormDid = did[walletSchema.DID_URI_LONG_FORM]
            logger("roots - Publishing DID to Prism", longFormDid)
            try {
                const newWalJson = await PrismModule.publishDid(getWalletJson(currentWal._id), did.alias)
                const result = await updateWallet(currentWal._id, currentWal.passphrase, newWalJson)
                const pubDid = getDid(didAlias)
                if(pubDid) {
                    return isDidPublished(pubDid)
                } else {
                    console.error("roots - DID was NOT published",newWalJson)
                }

            } catch (error) {
                console.error("roots - Error publishing DID", longFormDid, "w/DID alias", didAlias, error, error.stack)
            }
        } else {
            logger("roots - already", PUBLISHED_TO_PRISM, did.alias)
            return true;
        }
    }
}

//------------------ Chats  --------------
export async function createChat(alias: string, fromDidAlias: string, toDid: string, title="Untitled") {
    logger("roots - Creating chat",alias,"for toDid",toDid,"and fromDidAlias",fromDidAlias,"w/ title",title)
    const chatItemCreated = await createChatItem(alias, fromDidAlias, toDid, title)
    logger("roots - chat item created/existed?",chatItemCreated)
    const chatItem = getChatItem(alias)
    logger("roots - chat item",chatItem)

    if(chatItemCreated && chatItem) {
        logger("Created chat and added welcome to chat",chatItem.title)
        if(!(alias === rel.YOU_ALIAS)) {
            const chMsg = await sendMessage(chatItem,
                "You are now in contact with "+alias,
                MessageType.TEXT,rel.getRelItem(rel.ROOTS_BOT))
            const statusMsg = await sendMessage(getChatItem(rel.YOU_ALIAS),
                "New contact added: "+alias,
                MessageType.TEXT,rel.getRelItem(rel.ROOTS_BOT))
        }
        return true;
    } else {
        console.error("Could not create chat",fromDidAlias, toDid,title);
        return false
    }
}

async function createChatItem(chatAlias: string, fromDidAlias: string, toDid: string, title=chatAlias) {
    logger('roots - Creating a new chat item',chatAlias)
    if(getChatItem(chatAlias)) {
        logger('roots - chat item already exists',chatAlias)
        return true
    } else {
        const chatItem = models.createChat(chatAlias, fromDidAlias, [toDid], title)
        const savedChat = await store.saveItem(models.getStorageKey(chatAlias, models.ModelType.CHAT), JSON.stringify(chatItem))
        if(savedChat) {
            logger('roots - new chat saved',chatAlias)
            return true
        } else {
            logger('roots - could not save new chat',chatAlias)
            return false
        }
    }
}

//TODO iterate to verify DID connections if cache is expired
export async function getAllChats () {
    const allChats = getChatItems();

    const result = {paginator: {items: allChats}};
    result.paginator.items.forEach(function (item, index) {
        logger("roots - getting chats",index+".",item.id);
    });
    return result;
}

export async function getChatByRel(rel: models.contact) {
    logger("getting chat by rel",rel.displayName)
    const chat = getChatItem(rel.displayName)
    logger("got chat by rel",chat.id)
    return chat
}

export function getChatItem(chatAlias: string) {
    logger("roots - getting chat item",chatAlias)
    const chatJson = store.getItem(models.getStorageKey(chatAlias,models.ModelType.CHAT))
    logger("roots - got chat",chatJson)
    if(chatJson) {
        const chat = JSON.parse(chatJson)
        logger("roots - parsed chat json w/keys",Object.keys(chat));
        return chat;
    } else {
       logger("roots - could not get chat item",chatAlias)
    }
}

//TODO make order of chats deterministic (likely should be most recent first)
function getChatItems() {
    logger("roots - getting chat items")
    const chatItemJsonArray = store.getItems(allChatsRegex)
    logger("roots - got chat items",String(chatItemJsonArray))
    const chats = chatItemJsonArray.map(chatItemJson => JSON.parse(chatItemJson))
    return chats;
}

function getAllDidAliases(wallet: models.wallet) {
    const dids = wallet[walletSchema.WALLET_DIDS];
    if(!dids || dids == null || dids.length <= 0) {
        logger("No dids to get")
        return [];
    } else {
        const aliases = dids.map(did => did[walletSchema.DID_ALIAS]);
        logger("got did aliases",String(aliases));
        return aliases;
    }
}

async function loadChats() {
    try {
        const aliases = getAllDidAliases(currentWal);
        const result = await store.restoreItems(models.getStorageKeys(aliases,models.ModelType.CHAT));
        if(result) {
            logger("roots - successfully loaded chat items",aliases)
            return true;
        }
        else {
            console.error("roots - Failed to load chat items",aliases)
            return false;
        }
    } catch(error) {
        console.error("roots - Failed to load chat items",error,error.stack)
        return false;
    }
}

async function updateChat(chat: models.chat) {
    const chatStoreId = models.getStorageKey(chat.id,models.ModelType.CHAT);
    const updated = await store.updateItem(chatStoreId,JSON.stringify(chat));
    if(updated) {
        logger("Updated chat storage",chatStoreId);
        return true;
    }else {
        logger("Unable to update chat storage",chatStoreId);
        return false;
    }
}

// ---------------- Messages  ----------------------

function addQuickReply(msg: models.message) {
    if(msg.type === MessageType.PROMPT_PUBLISH) {
        msg.quickReplies = {type: 'checkbox',keepIt: true,
            values: [
                {
                    title: 'Add to Prism',
                    value: MessageType.PROMPT_PUBLISH+PUBLISH_DID,
                    messageId: msg.id,
                }
            ],
        }
    }
    if(msg.type === MessageType.PROMPT_OWN_DID) {
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
    if(msg.type === MessageType.PROMPT_ACCEPT_CREDENTIAL) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [{
                title: 'Accept',
                value: MessageType.PROMPT_ACCEPT_CREDENTIAL+CRED_ACCEPTED,
                messageId: msg.id,
            },
            ],
        }
    }
    if(msg.type === MessageType.PROMPT_ISSUED_CREDENTIAL) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [{
                title: 'View',
                value: MessageType.PROMPT_ISSUED_CREDENTIAL+CRED_VIEW,
                messageId: msg.id,
            },{
                title: 'Revoke',
                value: MessageType.PROMPT_ISSUED_CREDENTIAL+CRED_REVOKE,
                messageId: msg.id,
            },
            ],
        }
    }
    if(msg.type === MessageType.PROMPT_OWN_CREDENTIAL) {
        msg.quickReplies = {
            type: 'checkbox',
            keepIt: true,
            values: [
                {
                    title: 'View',
                    value: MessageType.PROMPT_OWN_CREDENTIAL+CRED_VIEW,
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

export function getMessagesByChat(chatAlias: string) {
    logger("roots - getting message items for chat",chatAlias)
    const msgRegex = new RegExp('^'+models.getStorageKey(chatAlias,models.ModelType.MESSAGE)+'*')
    const msgItemJsonArray = store.getItems(msgRegex)
    logger("roots - got msg items",msgItemJsonArray.length)
    const chatMsgs = msgItemJsonArray.map(
        (msgItemJson) => {
            logger("parsing msg json",msgItemJson)
            return JSON.parse(msgItemJson);
        }
    )
    chatMsgs.sort((a: models.message,b: models.message) => (a.createdTime < b.createdTime) ? -1 : 1)
    return chatMsgs;
}

export function getMessageById(msgId: string) {
    logger("roots - getting message by id",msgId)
    const msgJson = store.getItem(msgId)
    if(msgJson) {
        const msg = JSON.parse(msgJson)
        return msg
    } else {
        console.error("Cannot get message by id, not found",msgId)
    }
}

export function getMessagesByRel(relId: string) {
    logger("roots - getting message items by user",relId)
    const msgRegex = new RegExp(models.ModelType.MESSAGE+'_'+replaceSpecial(relId)+'*')
    const msgItemJsonArray = store.getItems(msgRegex)
    logger("roots - got user msg items",msgItemJsonArray.length)
    const chatMsgs = msgItemJsonArray.map(
        (msgItemJson) => {
            logger("parsing msg json",msgItemJson)
            return JSON.parse(msgItemJson);
        }
    )
    chatMsgs.sort((a,b) => (a.createdTime < b.createdTime) ? -1 : 1)
    return chatMsgs;
}

export async function sendMessages(chat: models.chat,msgs: string[],msgType: MessageType,relDisplay: models.contact) {
    msgs.map(async (msg) => await sendMessage(chat,msg,msgType,relDisplay))
}

//TODO unify aliases and storageKeys?
export async function sendMessage(chat: models.chat,msgText: string,msgType: MessageType,relDisplay: models.contact,system=false,data={}) {
    const msgTime = Date.now()
    logger("roots - rel",relDisplay.id,"sending",msgText,"to chat",chat.id);
    const msgId = models.createMessageId(chat.id,relDisplay.id,msgTime);
    let msg = models.createMessage(msgId, msgText, msgType, msgTime, relDisplay.id, system, data);
    msg = addMessageExtensions(msg);
    try {
        const msgJson = JSON.stringify(msg)
        const result = await store.saveItem(msg.id,msgJson)
        if(sessions[chat.id]) {
            sessions[chat.id].onReceivedMessage(msg)
        }
        logger("roots - Sent/Stored message",msgJson)
        return msg
    } catch(error) {
        console.error("roots - Could not save message for rel",relDisplay.id,"w/msg",msgText,"to chat",chat.id,error,error.stack)
        return;
    }
}

export async function processCredentialResponse(chat: models.chat, reply: Reply) {
    logger("roots - quick reply credential",chat.id,reply)
    const credReqAlias = getCredRequestAlias(reply.messageId)
    logger("roots - got credential request", credReqAlias)
    const replyJson = JSON.stringify(reply)
    //TODO should we allow updates to previous credRequest response?
    logger("roots - updating cred req",replyJson)
    const status = await store.updateItem(credReqAlias,replyJson)
    if(!status) {
        console.error("roots - Could not save credential request for",credReqAlias)
        return false;
    } else {
        if(reply.value.endsWith(CRED_ACCEPTED)) {
            logger("roots - quick reply credential accepted",credReqAlias)
            startProcessing(chat.id,reply.messageId)
            const credAlias = getCredentialAlias(reply.messageId);
            const credHash = await acceptCredential(credAlias)
            if(credHash) {
                const hashStr = credHash.toString()
                logger("accepted credential w/hash",hashStr)
                const credOwnMsg = await sendMessage(chat,"Credential accepted.",
                    MessageType.PROMPT_OWN_CREDENTIAL,rel.getRelItem(rel.ROOTS_BOT),false,hashStr)
                if(!(chat.id === rel.YOU_ALIAS)) {
                    await sendMessage(getChatItem(rel.YOU_ALIAS),"You accepted a credential from "+
                        chat.id,MessageType.PROMPT_OWN_CREDENTIAL,rel.getRelItem(rel.ROOTS_BOT),false,hashStr)
                }
                const importedCred = await getImportedCredByHash(hashStr)
                const credJson = JSON.stringify(importedCred)
                logger("saving imported cred",hashStr,credJson)
                store.saveItem(hashStr,credJson)
            }
            cred.hasNewCreds()
            endProcessing(chat.id,reply.messageId)
            return credHash;
        } else if (reply.value.endsWith(CRED_REJECTED)) {
            logger("roots - quick reply credential rejected",credReqAlias)
            return true
        } else {
            logger("roots - unknown credential prompt reply",credReqAlias,replyJson)
            return false
        }
    }
}

//TODO use workflow instead of hardcoding it here
export async function processPublishResponse(chat: models.chat) {
    logger("roots - started publish DID alias",chat.fromAlias)
    startProcessing(chat.id,chat.fromAlias)
    const published = await publishPrismDid(chat.fromAlias);
    if(published) {
        endProcessing(chat.id,chat.fromAlias)
        const pubDid = getDid(chat.fromAlias)
        if(pubDid) {
            const didPubTx = getDidPubTx(pubDid[walletSchema.DID_ALIAS])
            const didPubMsg = await sendMessage(chat, PUBLISHED_TO_PRISM,
                MessageType.PROMPT_OWN_DID, rel.getRelItem(rel.PRISM_BOT),
                false, pubDid[walletSchema.DID_URI_LONG_FORM])
            const didLinkMsg = await sendMessage(chat, BLOCKCHAIN_URL_MSG,
                MessageType.BLOCKCHAIN_URL, rel.getRelItem(rel.PRISM_BOT),
                false, didPubTx?.url)
            if (didLinkMsg) {
                //const didMsg = await sendMessage(chat,JSON.stringify(pubDid),DID_JSON,rel.getRelItem(rel.PRISM_BOT),true);
                if (demo) {
                    logger("roots - demo celebrating did publishing credential", pubDid[walletSchema.DID_URI_LONG_FORM])
                    const vcMsg = await sendMessage(chat,
                        "To celebrate your published DID, a verifiable credential is being created for you.",
                        MessageType.TEXT, rel.getRelItem(rel.ROOTS_BOT))
                    if(vcMsg) {
                        const credIssueAlias = await issueDemoPublishDidCredential(chat, vcMsg.id)
                        if (credIssueAlias) {
                            const credPubTx = getCredPubTx(pubDid[walletSchema.DID_ALIAS], credIssueAlias)
                            const credSuccess = await sendMessage(chat, "You have issued yourself a verifiable credential!",
                                MessageType.PROMPT_ISSUED_CREDENTIAL, rel.getRelItem(rel.ROOTS_BOT), false, credIssueAlias)
                            const credLinkMsg = await sendMessage(chat, BLOCKCHAIN_URL_MSG,
                                MessageType.BLOCKCHAIN_URL, rel.getRelItem(rel.PRISM_BOT), false, credPubTx?.url)

                            if (credLinkMsg) {
                                logger("roots - demo credential issued", credIssueAlias)
                                const credReqMsg = await sendMessage(chat,
                                    "Do you want to accept this verifiable credential",
                                    MessageType.PROMPT_ACCEPT_CREDENTIAL, rel.getRelItem(rel.ROOTS_BOT))
                                if (credReqMsg) {
                                    const credAcceptAlias = getCredentialAlias(credReqMsg.id)
                                    const cred = getIssuedCredential(credIssueAlias);
                                    const credJson = JSON.stringify(cred?.verifiedCredential)
                                    logger("roots - cred request prepared", credAcceptAlias, credJson)
                                    const savedCredReq = await store.saveItem(credAcceptAlias, credJson);
                                    if (savedCredReq) {
                                        logger("Successfully submitted demo cred req", credAcceptAlias, credJson)
                                    }
                                }
                            }
                        }
                    } else {
                        console.error("roots - unable to issue cred", chat, pubDid)
                    }
                }
            }
            return chat
        } else {
            console.error("could not retreive newly created DID",chat.fromAlias)
        }
    } else {
        logger("roots - Could not process publish DID request",chat.id)
        const credReqMsg = await sendMessage(chat,
                            "DID was already added to Prism",
                            MessageType.TEXT,rel.getRelItem(rel.PRISM_BOT))
        return chat;
    }
}

// ------------------ Credentials ----------

async function acceptCredential(credAlias: string) {
    const verCredJson = await store.getItem(credAlias);
    if(verCredJson) {
        const verCred = JSON.parse(verCredJson)
        const credHash = verCred.proof.hash
        if (!getImportedCredByHash(credHash)) {
            logger("roots - accepting credential", credAlias, verCredJson)
            const newWalJson = await PrismModule.importCred(getWalletJson(currentWal._id), credAlias, verCredJson);
            if (newWalJson) {
                const savedWal = await updateWallet(currentWal._id, currentWal.passphrase, newWalJson)
                if (savedWal) {
                    logger("roots - Accepted credential", credAlias)
                    return credHash
                } else {
                    console.error("Could not accept credential, unable to save wallet", credAlias, credHash)
                    return
                }
            } else {
                console.error("Could not import accepted credential", credAlias, credHash)
                return
            }
        } else {
            console.error("Credential alias already in use", credAlias, credHash)
            return
        }
    } else {
        console.error("Credential not found in storage", credAlias)
        return
    }
}

export function getImportedCredByHash(credHash: string) {
    logger("roots - Getting imported credential",credHash)

    if(currentWal.importedCredentials) {
        const cred = currentWal.importedCredentials.find((cred) => {
            const curCredHash = cred.verifiedCredential.proof.hash
            if(curCredHash === credHash) {
                logger("roots - Found cred hash",curCredHash)
                return true
            }
            else {
                logger("roots - cred hash",curCredHash,"does not match",credHash)
                return false
            }
        })
        if(cred) {
            logger("got imported cred w/keys"+Object.keys(cred))
            return cred
        }
    } else {
        logger("roots - No imported credential hash",credHash)
        return;
    }
}

function getCredentialAlias(msgId: string) {
    const alias = msgId.replace(models.ModelType.MESSAGE,models.ModelType.CREDENTIAL)
    logger("roots - generated credential alias",alias)
    return alias
}

export async function getImportedCredByMsgId(msgId: string) {
    const importedCredHash = getMessageById(msgId).data
    return await store.getItem(importedCredHash)
}

export async function getIssuedCredByMsgId(msgId: string) {
    const issuedCredAlias = getMessageById(msgId).data
    const cred = getIssuedCredential(issuedCredAlias);
    const credJson = JSON.stringify(cred)
    return credJson
}

function getCredPubTx (didAlias: string, credAlias: string) {
    logger("roots - getting cred pub tx",didAlias)
    const txLogs = currentWal[walletSchema.WALLET_TX_LOGS]
    const txName = didAlias+"/"+credAlias
    logger("roots - got tx logs",txLogs,"searching for",txName)
    const credPubTxLog = txLogs?.find(txLog => (txLog.action === walletSchema.CRED_ISSUE_TX && txLog.description === txName))
    logger("roots - got cred publish tx log",credPubTxLog)
    return credPubTxLog;
}

function getCredRequestAlias(msgId: string) {
    return msgId.replace(models.ModelType.MESSAGE,models.ModelType.CRED_REQUEST)
}

export function getIssuedCredential(credAlias: string): models.issuedCredential|undefined {
    logger("roots - getting issued credential",credAlias)

    if(currentWal && currentWal.issuedCredentials) {
        const iCred = currentWal.issuedCredentials.find(cred => {
            if(cred.alias === credAlias) {
                logger("roots - Found alias",cred.alias)
                return true
            }
            else {
                logger("roots - Alias",cred.alias,"does not match",credAlias)
                return false
            }
        })
        if(iCred) {
            logger("roots - got issued cred",JSON.stringify(cred))
            return iCred
        } else {
            logger("roots - no issued cred",credAlias)
        }
    } else {
        logger("roots - No issued credential in wallet",credAlias)
        return;
    }
}

export function getImportedCredentials() {
    logger("roots - Getting imported credentials")
    let result: models.credential[] = []
    logger("roots - current wal has keys",Object.keys(currentWal))
    if(currentWal.importedCredentials) {
        const creds = currentWal.importedCredentials;
        if(creds && creds.length > 0) {
            logger("roots - getting imported creds",creds.length)
            creds.forEach(cred => logger("roots - imported cred",JSON.stringify(cred)))
            result = creds
        } else {
            logger("roots - no imported creds found")
        }
    } else {
        logger("roots - No imported credentials")
    }
    return result;
}

export function getIssuedCredentials(didAlias: string) {
    logger("roots - Getting issued credentials",didAlias)
    const longDid = getDid(didAlias)?.uriLongForm
    if(currentWal.issuedCredentials) {
        const creds = currentWal.issuedCredentials.filter(cred => {
            if(cred.claim.subjectDid === longDid) {
                logger("roots - Found alias",cred.alias)
                return true
            }
            else {
                logger("roots - Alias",cred.claim.subjectDid,"does not match",longDid)
                return false
            }
        })
        if(creds && creds.length > 0) {
            return creds
        }
    } else {
        logger("roots - No issued credentials for",didAlias)
    }
    return;
}

async function issueCredential(didAlias: string,credAlias: string,cred: models.credential) {
    const credJson = JSON.stringify(cred)
    console.log("roots - issuing credential", credJson)
    let result;

    try {
        const newWalJson = await PrismModule.issueCred(getWalletJson(currentWal._id), didAlias, credJson);
        logger("roots - wallet after issuing credential",newWalJson)
        if(newWalJson) {
            const savedWal = await updateWallet(currentWal._id,currentWal.passphrase,newWalJson)
            if(savedWal) {
                logger("roots - wallet saved after issuing credential",savedWal)
                const newCred = getIssuedCredential(cred.alias)
                logger("roots - Issued credential",newCred?.alias)
                result = newCred
            } else {
                console.error("roots - Could not issue credential, unable to save wallet")
            }
        } else {
            console.error("roots - Could not issue credential")
        }
    } catch(error) {
        console.error("Could not issue credential to",didAlias,credAlias,cred,error,error.stack)
    }

    return result
}

export async function processRevokeCredential(chat: models.chat, reply: Reply) {
    const msg = getMessageById(reply.messageId)
    const credAlias = msg.data
    startProcessing(chat.id,credAlias+CRED_REVOKE)
    logger("roots - revoking credential with alias",credAlias)
    const revokedCred = await revokeCredentialByAlias(credAlias)
    logger("roots - cred revoke result",revokedCred)
    if(revokedCred) {
        endProcessing(chat.id,credAlias+CRED_REVOKE)
        console.log("roots - credential revoked",revokedCred)
        const credRevokedMsg = await sendMessage(chat,"Credential is revoked.",
            MessageType.TEXT,rel.getRelItem(rel.ROOTS_BOT),false,credAlias)
    } else {
        endProcessing(chat.id,credAlias+CRED_REVOKE)
        console.log("roots - could not revoke credential",credAlias)
        const credRevokedMsg = await sendMessage(chat,"Could not revoke credential "+credAlias,
            MessageType.TEXT,rel.getRelItem(rel.ROOTS_BOT),false,credAlias)
    }
}

export async function revokeCredentialByAlias(credAlias: string) {
    logger("Revoking credential",credAlias)
    const issuedCred = getIssuedCredential(credAlias)
    if(issuedCred) {
        return await revokeCredential(issuedCred)
    } else {
        console.error("could not revoke credential by alias", credAlias)
        return issuedCred
    }
}

export async function revokeCredential(issuedCred: models.credential) {
    logger("roots - Revoking issued credential w/keys",Object.keys(issuedCred))
    const jsonWallet = getWalletJson(currentWal._id)
    console.log("roots - Revoking issued cred",issuedCred.alias,jsonWallet)
    const newWalJson = await PrismModule.revokeCred(jsonWallet,issuedCred.alias)
    if(newWalJson) {
        const savedWal = await updateWallet(currentWal._id,currentWal.passphrase,newWalJson)
        if(savedWal) {
            logger("roots - Revoked credential",issuedCred.alias)
            return getIssuedCredential(issuedCred.alias)
        } else {
            console.error("Could not revoke credential, unable to save wallet",issuedCred.alias)
            return
        }
    } else {
        console.error("Could not revoke accepted credential",issuedCred.alias)
        return
    }
}

export async function processVerifyCredential(chat: models.chat, credHash:string) {
    startProcessing(chat.id,credHash+CRED_VERIFY)
    const verify = await verifyCredentialByHash(credHash)
    const vDate = Date.now()
    logger("roots - verification result",verify,vDate)
    const verResult = JSON.parse(verify)
    if(verResult && verResult.length <= 0) {
        endProcessing(chat.id,credHash+CRED_VERIFY)
        console.log("roots - credential verification result",verResult)
        const credVerifiedMsg = await sendMessage(chat,"Credential is valid.",
            MessageType.TEXT,rel.getRelItem(rel.ROOTS_BOT),false,vDate)
    } else if(verResult.length > 0) {
        endProcessing(chat.id,credHash+CRED_VERIFY)
        console.log("roots - credential is invalid",verResult)
        const credVerifiedMsg = await sendMessage(chat,"Credential is invalid w/ messages: "+verResult,
            MessageType.TEXT,rel.getRelItem(rel.ROOTS_BOT),false,vDate)
    }
    else {
        endProcessing(chat.id,credHash+CRED_VERIFY)
        console.log("roots - could not get credential verification result",verResult)
        const credVerifiedMsg = await sendMessage(chat,"Could not verify credential at "+vDate,
            MessageType.TEXT,rel.getRelItem(rel.ROOTS_BOT))
    }
}

export async function verifyCredentialByHash(credHash: string) {
    logger("Verifying credential",credHash)
    const importedCred = getImportedCredByHash(credHash)
    if(importedCred) {
        return verifyCredential(importedCred)
    } else {
        console.error("could not verify credential by hash",credHash)
    }
}

export async function verifyCredential(importedCred: models.credential) {
    logger("Verifying credential w/keys",Object.keys(importedCred))
    const jsonWallet = getWalletJson(currentWal._id)
    console.log("verifying imported cred",importedCred.alias,jsonWallet)
    const messageArray = await PrismModule.verifyImportedCred(jsonWallet,importedCred.alias)
    logger("Verification result",JSON.stringify(messageArray))
    return messageArray
}

// ------------------ Session ---------------
const sessionInfo={};
const sessionState=[];
export function startChatSession(chatId: string, sessionInfo: models.session): models.sessionStatus {
    logger("roots - starting session w/chat",sessionInfo.chat.title);
    sessions[chatId] = sessionInfo

    return {
        succeeded: "session succeeded",
        end: "session ended",
    };
}

//----------- Processing -------------

export function startProcessing(processGroup: string, processAlias:string) {
    logger("starting processing",processGroup,processAlias)
    if(!allProcessing[processGroup]) {
        allProcessing[processGroup] = {}
    }
    allProcessing[processGroup][processAlias] = {
        startDate: Date.now(),
        polling: setInterval(async function () {
             const processing = isProcessing(processGroup)
             updateProcessIndicator(processGroup, processing)
        }, POLL_TIME),
    }
    logger("started processing",processGroup,processAlias,allProcessing[processGroup][processAlias])
}

export function endProcessing(processGroup: string, processAlias: string) {
    logger("ending processing",processGroup,processAlias)
    if(!allProcessing[processGroup]) {
        console.error("Cannot end processing in group that does not exist",processGroup)
    } else if(!allProcessing[processGroup][processAlias]) {
        console.error("Cannot end processing of id that does not exist",processAlias)
    } else {
        logger("processing ended",processGroup,processAlias)
        clearInterval(allProcessing[processGroup][processAlias].polling)
        allProcessing[processGroup][processAlias].endDate = Date.now()
        updateProcessIndicator(processGroup,isProcessing(processGroup))
    }
}

function isActiveProcess(processGroup: string,processAlias: string) {
    const endDate = allProcessing[processGroup][processAlias].endDate
    const isActive = (!endDate)
    logger("is process active?",processGroup,processAlias,isActive)
    return isActive
}

function getActiveProcesses(processGroup: string) {
    const allActive: process[] = []
    if(!processGroup) {
        logger("getting all active processing groups")
        const allGroups = Object.keys(allProcessing)
        allGroups.forEach(group => {allActive.concat(getActiveProcesses(group))})
    } else {
        logger("getting active processing for group",processGroup)
        if(allProcessing[processGroup]) {
            const allProcAliases = Object.keys(allProcessing[processGroup])
            const activeProcAliases = allProcAliases.filter(procAlias => isActiveProcess(processGroup,procAlias))
            if(activeProcAliases && activeProcAliases.length > 0) {
                const active = activeProcAliases.map(procAlias => allProcessing[processGroup][procAlias]);
                logger("found active processing",JSON.stringify(active))
                allActive.concat(active)
            }
        }
    }
    logger("roots - all active processes:",allActive.length)
    return allActive
}

export function isProcessing(processGroup: string) {
    logger("roots - determining if is processing",processGroup)
    const activeProcs = getActiveProcesses(processGroup)
    let processing = false
    if(activeProcs && activeProcs.length > 0){
        logger("roots - active processes:",JSON.stringify(activeProcs))
        processing = true;
    } else {
        logger("roots - signaling not processing")
        processing = false;
    }

    return processing;
}

//TODO set processing per group
export function updateProcessIndicator(processGroup: string,processing: boolean) {
    logger("roots - updating processing indicator",processGroup,processing)
    if(sessions[processGroup]) {
        sessions[processGroup].onProcessing(processing)
    }
}

//----------- DEMO --------------------

export async function issueDemoContactCredential(chat: models.chat,msgId: string) {
    logger("roots - Trying to create demo credential for contact",chat.id,msgId)
    const credMsgs = []
    const credAlias = getCredentialAlias(msgId)
    const alreadyIssued = getIssuedCredential(credAlias)
    const did = getDid(chat.fromAlias)
    if(!alreadyIssued && did) {
        logger("roots - credential not found, creating....",credAlias)
        const didLong = did[walletSchema.DID_URI_LONG_FORM]
        logger("roots - Creating demo credential for your chat",chat.id,"w/ your long form did",didLong)
        const toDid = chat.toDids[0][0]
        console.log("roots - contact credential being issued to DID",toDid)
        const today = new Date(Date.now());
        const cred = {
            alias: credAlias,
            batchId: "",
            claim: {
                content: "{\"name\": \"Added new contact\",\"achievement\": \"You added a new contact "+chat.id+"\",\"date\": \""+today.toISOString()+"\"}",
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
        logger("roots - issuing demo contact credential",cred)
        startProcessing(chat.id,credAlias)
        const issuedCred = await issueCredential(chat.fromAlias, credAlias, cred)
        endProcessing(chat.id,credAlias)
        if(issuedCred) {
            logger("Prism issued contact credential",issuedCred)
            return credAlias;
        } else {
            logger("Could not issue Prism contact credential")
            return false;
        }
    } else {
        logger("roots - Couldn't issue demo contact credential, is the DID published",
            did,"was the credential already found",alreadyIssued)
        return false
    }
}

export async function issueDemoPublishDidCredential(chat: models.chat,msgId: string) {
    logger("roots - Trying to create demo credential for publishing DID",chat.id,msgId)
    const credMsgs = []
    const credAlias = getCredentialAlias(msgId)
    const alreadyIssued = getIssuedCredential(credAlias)
    const did = getDid(chat.fromAlias)
    if(did) {
        const didPub = isDidPublished(did)
        if (didPub && !alreadyIssued) {
            logger("roots - Chat is published and credential not found, creating....")
            const didLong = did[walletSchema.DID_URI_LONG_FORM]
            logger("roots - Creating demo credential for chat", chat.id, "w/long form did", didLong)
            const today = new Date(Date.now());
            const cred = {
                alias: credAlias,
                issuingDidAlias: chat.fromAlias,
                claim: {
                    content: "{\"name\": \"Prism DID publisher\",\"achievement\": \"Published a DID to Cardano - Atala Prism\",\"date\": \"" + today.toISOString() + "\"}",
                    subjectDid: didLong,
                },
                verifiedCredential: {
                    encodedSignedCredential: "",
                    proof: {
                        hash: "",
                        index: -1,
                        siblings: [],
                    },
                },
                batchId: "",
                credentialHash: "",
                operationHash: "",
                revoked: false,
            }
            logger("roots - issuing demo credential", cred)
            startProcessing(chat.id, credAlias)
            const issuedCred = await issueCredential(chat.fromAlias, credAlias, cred)
            endProcessing(chat.id, credAlias)
            if (issuedCred) {
                logger("Prism issued credential", issuedCred)
                return credAlias;
            } else {
                logger("Could not issue Prism credential")
                return false;
            }
        } else {
            logger("roots - Couldn't issue demo credential, is the chat published",
                didPub, "was the credential already found", alreadyIssued)
            return false
        }
    } else {
        console.error("roots - couldn't issue demo cred, DID not found",did)
    }
}

async function initDemos(fromDidAlias: string) {
    //const libraryRoot = await initRoot("libraryRoot", fromDidAlias, rootsDid("library"), "Library")
    //const rentalRoot = await initRoot("rentalRoot", fromDidAlias, rootsDid("vacationRental"), "Vacation Rental")
    //return libraryRoot && rentalRoot;
    return true;
}

async function initDemoAchievements(chat: models.chat) {


    await sendMessage(chat,ACHIEVEMENT_MSG_PREFIX+"Opened RootsWallet!",
      MessageType.STATUS,
      rel.getRelItem(rel.ROOTS_BOT))
    await sendMessage(chat,"{subject: you,issuer: RootsWallet,credential: Opened RootsWallet}",
      MessageType.CREDENTIAL_JSON,
      rel.getRelItem(rel.ROOTS_BOT))
    await sendMessage(chat,ACHIEVEMENT_MSG_PREFIX+"Clicked Example!",
      MessageType.STATUS,
      rel.getRelItem(rel.ROOTS_BOT))
    await sendMessage(chat,"{subject: you,issuer: RootsWallet,credential: Clicked Example}",
      MessageType.CREDENTIAL_JSON,
      rel.getRelItem(rel.ROOTS_BOT))
}

async function initDemoResume() {
}

export function isDemo() {
    return demo
}

export const walCliCommands=[
" ./wal.sh new-wallet holder_wallet -m poet,account,require,learn,misery,monitor,medal,great,blossom,steak,rain,crisp",
"./wal.sh new-did holder_wallet holder_did",
"./wal.sh new-did issuer_wallet issuer_did -i",
"./wal.sh publish-did issuer_wallet issuer_did",
"./wal.sh show-did holder_wallet holder_did",
"./wal.sh issue-cred issuer_wallet issuer_did did:prism:654a4a9113e7625087fd0d3143fcac05ba34013c55e1be12daadd2d5210adc4d:Cj8KPRI7CgdtYXN0ZXIwEAFKLgoJc2VjcDI1NmsxEiEDA7B2nZ_CvcIdkU2ovzBEovGzjwZECMUeHUeNo5_0Jug credential_a",
"./wal.sh verify-cred issuer_wallet issued credential_a",
"./wal.sh export-cred issuer_wallet credential_a credential_a.json",
"cat credential_a.json",
"./wal.sh import-cred holder_wallet credential_a credential_a.json",
"./wal.sh verify-cred holder_wallet imported credential_a",
"./wal.sh revoke-cred issuer_wallet credential_a",
"./wal.sh verify-cred issuer_wallet issued credential_a",
]

function rootsDid(alias: string) {
    return "did:root:"+replaceSpecial(alias);
}