import * as models from '../models'
import { logger } from '../logging'
import PrismModule from '../prism'
import { Reply } from 'react-native-gifted-chat';
import * as store from '../store'
import * as rel from '../relationships'
import { replaceSpecial } from '../utils'
import * as walletSchema from '../schemas/WalletSchema'

//msg types
export const BLOCKCHAIN_URL_MSG_TYPE = "blockchainUrlMsgType";
export const CREDENTIAL_JSON_MSG_TYPE = "jsonCredential";
export const DID_JSON_MSG_TYPE = "jsonDid";
export const DID_MSG_TYPE = "didMsgType";
export const PENDING_STATUS_MESSAGE = "rootsPendingStatus";
export const PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE = "rootsAcceptCredentialMsgType"
export const PROMPT_OWN_CREDENTIAL_MSG_TYPE = "rootsOwnCredentialMsgType"
export const PROMPT_OWN_DID_MSG_TYPE = "rootsOwnDidMsgType"
export const PROMPT_PUBLISH_MSG_TYPE = "rootsPromptPublishMsgType";
export const QR_CODE_MSG_TYPE = "rootsQRCodeMsgType"
export const STATUS_MSG_TYPE = "statusMsgType";
export const TEXT_MSG_TYPE = "textMsgType"
export const LINK_MSG_TYPE = "linkMsgType"

//meaningful literals
export const ACHIEVEMENT_MSG_PREFIX = "You have a new achievement: ";
export const BLOCKCHAIN_URL_MSG = "*Click to see the blockchain details*";
export const PUBLISHED_TO_PRISM = "*Your DID was added to Prism*";
export const SHOW_CRED_QR_CODE = "Show Cred QR code";
export const SHOW_DID_QR_CODE = "Show Chat QR code";

//state literals
export const CRED_ACCEPTED = "credAccepted"
export const CRED_REJECTED = "credRejected"
export const CRED_SENT = "credSent"
export const CRED_VERIFY = "credVerify"
export const CRED_VIEW = "credView"
export const PUBLISH_DID = "publishDID"
export const DO_NOT_PUBLISH_DID = "doNotPublishDID"

const allChatsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_CHAT)+'*')
const allCredsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_CREDENTIAL)+'*')
const allCredReqsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_CRED_REQUEST)+'*')
const allMsgsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_MESSAGE)+'*')
const allSettingsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_SETTING)+'*')

export const TEST_WALLET_NAME = "testWalletName"
const demo = true;

let currentWal;

const handlers = {};
const allProcessing = {};

export async function initRootsWallet() {
    logger("roots - initializing RootsWallet")

    logger("roots - initializing your Did")
    const createdDid = await createDid(rel.YOU_ALIAS)
    const relCreated = await rel.createRelItem(rel.YOU_ALIAS,rel.YOU_ALIAS, rel.catalystLogo, createdDid);
    logger("roots - initialized your rel?",relCreated)
    const myRel = rel.getRelItem(rel.YOU_ALIAS)

    logger("roots - initializing your narrator bots roots")
    const prism = await initRoot(rel.PRISM_BOT, createdDid[walletSchema.DID_ALIAS], rootsDid(rel.PRISM_BOT), rel.PRISM_BOT, rel.prismLogo)
    const rw = await initRoot(rel.ROOTS_BOT, createdDid[walletSchema.DID_ALIAS], rootsDid(rel.ROOTS_BOT), rel.ROOTS_BOT, rel.rootsLogo)

    logger("roots - initializing your history root")
    const historyRootAlias = rel.HISTORY_ALIAS
    const history = await initRoot(historyRootAlias, createdDid[walletSchema.DID_ALIAS], rootsDid("history"), "History", rel.starLogo)

    logger("roots - posting your initialization history messages")
    const historyChat = getChatItem(historyRootAlias)
    const welcomeAchMsg = await sendMessage(historyChat,
        "Welcome to your RootsWallet history!",
        TEXT_MSG_TYPE,rel.getRelItem(rel.ROOTS_BOT))
    const achMsg = await sendMessage(historyChat,
        "We'll post new events here.",
        TEXT_MSG_TYPE,rel.getRelItem(rel.ROOTS_BOT))
    const createdWalletMsg = await sendMessage(historyChat,
        "You created your wallet: "+currentWal._id,TEXT_MSG_TYPE,rel.getRelItem(rel.ROOTS_BOT))
    const createdDidMsg = await sendMessage(historyChat,
        "You created your first decentralized ID!",
        TEXT_MSG_TYPE,rel.getRelItem(rel.ROOTS_BOT))
    await sendMessage(historyChat,"Your new DID is being added to Prism so that you can receive verifiable credentials (called VCs) from other users and organizations like Catalyst, your school, rental companies, etc.",
        TEXT_MSG_TYPE,rel.getRelItem(rel.PRISM_BOT))
    //intentionally not awaiting
    processPublishResponse(historyChat)

    if(demo) {
        logger("roots - initializing your demos")
        await initDemos(createdDid[walletSchema.DID_ALIAS])
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

//----------------- Prism ----------------------
export function setPrismHost(host="ppp.atalaprism.io", port="50053") {
    logger("roots - setting Prism host and port",host,port)
    PrismModule.setNetwork(host,port)
    store.updateItem(getSettingAlias("prismNodePort"),port)
    store.updateItem(getSettingAlias("prismNodeHost"),host)
}

export function getPrismHost() {
    const host = store.getItem(getSettingAlias("prismNodeHost"))
    return (host) ? host :  "ppp.atalaprism.io";
}

//---------------- Settings -----------------------
function applyAppSettings() {
    setPrismHost(store.getItem(getSettingAlias("prismNodeHost")),
        store.getItem(getSettingAlias("prismNodePort")));
}

function getSettingAlias(key) {
    return models.getStorageKey(key,models.MODEL_TYPE_SETTING)
}

export async function loadSettings() {
    const settings = await loadItems(allSettingsRegex)
    applyAppSettings();
    return settings;
}

//----------------- Wallet ---------------------
export async function createWallet(walName,mnemonic,walPass) {
    const prismWal = PrismModule.newWal(walName,mnemonic,walPass)
    const result = await updateWallet(walName,walPass,prismWal)
    if(result) {
        logger('Wallet created',store.getWallet(currentWal._id))
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

export async function hasWallet(walName) {
    if(await store.hasWallet(walName)) {
        logger("roots - Has wallet",store.getWallet(walName));
        return true;
    }
    else{
        logger("roots - Does not have wallet",walName);
        return false;
    }
 }

export function getRootsWallet(walName) {
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

export async function updateWallet(walName, walPass, walJson) {
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
            const walletJson = store.getWallet(currentWal._id)
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

export function getDid(didAlias) {
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
    logger("roots - got tx logs",txLogs)
    didPublishTxLog = txLogs?.find(txLog => (txLog.action === walletSchema.DID_PUBLISH_TX && txLog.description === didAlias))
    logger("roots - got DID publish tx log",didPublishTxLog)
    return didPublishTxLog;
}

function hasLongForm(did: Object) {
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

function isDidPublished(did: Object) {
    const didAlias = did[walletSchema.DID_ALIAS]
    console.log("roots - checking DID has been published",didAlias);
    didPubTxLog = getDidPubTx(didAlias)
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
    logger("publishing DID",did[walletSchema.DID_URI_CANONICAL_FORM],
        "and long form",did[walletSchema.DID_URI_LONG_FORM])
    if(!isDidPublished(did)) {
        const longFormDid = did[walletSchema.DID_URI_LONG_FORM]
        logger("roots - Publishing DID to Prism",longFormDid)
        try {
            const newWalJson = await PrismModule.publishDid(store.getWallet(currentWal._id), did.alias)
            const result = await updateWallet(currentWal._id,currentWal.passphrase,newWalJson)
            return isDidPublished(getDid(didAlias))
        } catch(error) {
            console.error("roots - Error publishing DID",longFormDid,"w/DID alias",chat.fromAlias,error,error.stack)
        }
    } else {
        logger("roots - already",PUBLISHED_TO_PRISM,did.alias)
        return true;
    }
}

//------------------ Chats  --------------
export async function createChat(alias: string, fromDidAlias: string, toDid: string, title="Untitled") {
    logger("roots - Creating chat",alias,"for toDid",toDid,"and fromDidAlias",fromDidAlias,"w/ title",title)
    const chatItemCreated = await createChatItem(alias, fromDidAlias, [toDid], title)
    logger("roots - chat item created/existed?",chatItemCreated)
    const chatItem = getChatItem(alias)
    logger("roots - chat item",chatItem)

    if(chatItemCreated && chatItem) {
        logger("Created chat and added welcome to chat",chatItem.title)
        return true;
    } else {
        console.error("Could not create chat",fromDidAlias, toDid,title);
        return false
    }
}

//TODO unify aliases and storageKeys?
async function createChatItem(chatAlias: string, fromDidAlias: string, toDid: string, title=chatAlias) {
    logger('roots - Creating a new chat item',chatAlias)
    if(getChatItem(chatAlias)) {
        logger('roots - chat item already exists',chatAlias)
        return true
    } else {
        const chatItem = models.createChat(chatAlias, fromDidAlias, [toDid], title)
        const savedChat = await store.saveItem(models.getStorageKey(chatAlias, models.MODEL_TYPE_CHAT), JSON.stringify(chatItem))
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

// export async function getChatByRel(relId: string) {
//
// }

export function getChatItem(chatAlias: string) {
    logger("roots - getting chat item",chatAlias)
    const chatJson = store.getItem(models.getStorageKey(chatAlias,models.MODEL_TYPE_CHAT))
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

// export function getChatsByRel(relId: string) {
//     logger("roots - getting chats for",relId);
//     const dedupedChats = [...new Set(
//         getMessagesByRel(relId).map(msg =>
//             msg.id.split("_"+models.MODEL_TYPE_MESSAGE)[0]
//         ))]
//     logger("roots - deduped chats for id",relId,dedupedChats)
//     const chats = dedupedChats.map(ch => getChatItem(ch))
//
//     return chats
// }

function getAllDidAliases(wallet) {
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
        const result = await store.restoreItems(models.getStorageKeys(aliases,models.MODEL_TYPE_CHAT));
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

//TODO improve error handling
// export async function publishChatDid(chat: Object) {
//     if(chat) {
//         logger("roots - published DID, saving publish status to chat...",chat.id)
//         publishPrismDid(chat.fromAlias)
//         chat["title"]=chat.title+"🔗"
//         const savedChat = await updateChat(chat);
//         if(savedChat) {
//             logger("Chat for published DID saved",chat.id)
//             return chat
//         } else {
//             //TODO since wallet is updated, should try to save chat again and again until successful
//             logger("Could not save chat for published DID",chat.id)
//             return;
//         }
//     } else {
//         logger("roots - During publish, could not update wallet")
//         return;
//     }
// }

async function updateChat(chat: Object) {
    const chatStoreId = models.getStorageKey(chat.id,models.MODEL_TYPE_CHAT);
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

// export async function addMessage(chatAlias: string, message) {
//     const msgJson = JSON.stringify(message)
//     logger("roots - Adding msg to chat",chatAlias,"msg:",msgJson)
// //     const chatJson = store.getItem(message.id,models.MODEL_TYPE_MESSAGE)
// //     const chat = JSON.parse(chatJson)
// //     //TODO expensive to search messages that are just JSON strings
// //     const foundJson = chat[models.CHAT_MESSAGES].find(msg => (JSON.parse(msg).id == message.id));
// //     if(foundJson) {
// //         console.error("Can't add message with the same id\n\tfound:",foundJson,"\n\twanted to add",msgJson)
// //         return false;
//     try {
//         chat[models.CHAT_MESSAGES].push(msgJson)
//         return await
//     }
// }

function addMessageExtensions(msg) {
    msg = addQuickReply(msg)
    return msg
}

export function getMessages(chatAlias: string, startFromMsgId?: string) {
    const chMsgs = getMessagesByChat(chatAlias)
    logger("roots - Getting chat",chatAlias,chMsgs.length,"messages")
    chMsgs.forEach(msg => logger("roots - got message",msg))
    if(!startFromMsgId) {
        return chMsgs;
    } else {
        logger("roots - Getting chat messages since",startFromMsgId)
        i = -1
        const findMsg = chMsgs.find(
            (msg) =>
            {
                i++;
                if(msg.id == startFromMsgId) return msg;
            }
        )
        const slicedMsgs = chMsgs.slice(i+1,chMsgs.length)
        if(!slicedMsgs || slicedMsgs.length <= 0) {
            console.error("roots - start message",startFromMsgId,"not found for chat",chatAlias)
            return []
        } else {
            logger("roots - Getting chat",chatAlias,"starting from",i+1,"to",slicedMsgs.length)
            return slicedMsgs
        }
    }
}

export function getMessagesByChat(chatAlias: string) {
    logger("roots - getting message items for chat",chatAlias)
    const msgRegex = new RegExp('^'+models.getStorageKey(chatAlias,models.MODEL_TYPE_MESSAGE)+'*')
    const msgItemJsonArray = store.getItems(msgRegex)
    logger("roots - got msg items",msgItemJsonArray.length)
    const chatMsgs = msgItemJsonArray.map(
        (msgItemJson) => {
            logger("parsing msg json",msgItemJson)
            return JSON.parse(msgItemJson);
        }
    )
    chatMsgs.sort((a,b) => (a.createdTime < b.createdTime))
    return chatMsgs;
}

export function getMessageById(msgId: string) {
    logger("roots - getting message by id",msgId)
    const msgJson = store.getItem(msgId)
    const msg = JSON.parse(msgJson)
    return msg
}

export function getMessagesByRel(relId: string) {
    logger("roots - getting message items by user",relId)
//     /rootsMsgType*did:prism:rootsbot1*/
//     "testing_rootsMsgType_did:prism:prismbot1_1651751636532",
    const msgRegex = new RegExp(models.MODEL_TYPE_MESSAGE+'_'+replaceSpecial(relId)+'*')
    const msgItemJsonArray = store.getItems(msgRegex)
    logger("roots - got user msg items",msgItemJsonArray.length)
    const chatMsgs = msgItemJsonArray.map(
        (msgItemJson) => {
            logger("parsing msg json",msgItemJson)
            return JSON.parse(msgItemJson);
        }
    )
    chatMsgs.sort((a,b) => (a.createdTime < b.createdTime))
    return chatMsgs;
}

export async function sendMessages(chat,msgs,msgType,relDisplay) {
    msgs.map(async (msg) => await sendMessage(chat,msg.text,msgType,relDisplay))
}

//TODO unify aliases and storageKeys?
export async function sendMessage(chat,msgText,msgType,relDisplay,system=false,data=undefined) {
    const msgTime = Date.now()
    logger("roots - rel",relDisplay.id,"sending",msgText,"to chat",chat.id);
    const msgId = models.createMessageId(chat.id,relDisplay.id,msgTime);
    let msg = models.createMessage(msgId, msgText, msgType, msgTime, relDisplay.id, system, data);
    msg = addMessageExtensions(msg);
    try {
        const msgJson = JSON.stringify(msg)
        const result = await store.saveItem(msg.id,msgJson)
        if(handlers["onReceivedMessage"]) {
            handlers["onReceivedMessage"](msg)
        }
        logger("roots - Sent/Stored message",msgJson)
        return msg
    } catch(error) {
        console.error("roots - Could not save message for rel",relDisplay.id,"w/msg",msgText,"to chat",chat.id,error,error.stack)
        return;
    }
}

function addQuickReply(msg) {
    if(msg.type === PROMPT_PUBLISH_MSG_TYPE) {
        msg["quickReplies"] = {type: 'checkbox',keepIt: true,
            values: [
            {
                title: 'Add to Prism',
                value: PROMPT_PUBLISH_MSG_TYPE+PUBLISH_DID,
                messageId: msg.id,
            }
            ],
        }
    }
    if(msg.type === PROMPT_OWN_DID_MSG_TYPE) {
        msg["quickReplies"] = {
            type: 'checkbox',
            keepIt: true,
            values: [
            {
                title: 'Show QR code',
                value: PROMPT_OWN_DID_MSG_TYPE,
                messageId: msg.id,
            }]
        }
    }
    if(msg.type === PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE) {
        msg["quickReplies"] = {
            type: 'checkbox',
            keepIt: true,
            values: [{
                title: 'Accept',
                value: PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE+CRED_ACCEPTED,
                messageId: msg.id,
            },
            ],
        }
    }
    if(msg.type === PROMPT_OWN_CREDENTIAL_MSG_TYPE) {
        msg["quickReplies"] = {
            type: 'checkbox',
            keepIt: true,
            values: [
            {
                title: 'Show QR code',
                value: PROMPT_OWN_CREDENTIAL_MSG_TYPE+CRED_VIEW,
                messageId: msg.id,
            }]
        }
    }
    return msg
}

export async function processCredentialResponse(chat: Object, reply: Object) {
    logger("roots - quick reply credential",chat.id,reply)
    const credReqAlias = getCredRequestAlias(reply.messageId)
    const replyJson = JSON.stringify(reply)
    //TODO should we allow updates to previous credRequest response?
    const status = await store.updateItem(credReqAlias,replyJson)
    if(!status) {
        console.error("roots - Could not save credential request for",credReqAlias)
        return false;
    } else {
        if(reply.value.endsWith(CRED_ACCEPTED)) {
            logger("roots - quick reply credential accepted",credReqAlias)
            startProcessing(chat.id,reply.messageId)
            const accepted = await acceptCredential(chat, reply.messageId)
            if(accepted) {
                const credOwnMsg = await sendMessage(chat,"Credential accepted.",PROMPT_OWN_CREDENTIAL_MSG_TYPE,rel.getRelItem(rel.ROOTS_BOT))
                store.saveItem(getCredentialAlias(credOwnMsg.id),await getCredentialByMsgId(reply.messageId))
                endProcessing(chat.id,reply.messageId)
            }
            return accepted;
        } else if (reply.value.endsWith(CRED_REJECTED)) {
            logger("roots - quick reply credential rejected",credReqAlias)
            return true
        } else {
            logger("roots - unknown credential prompt reply",credReqAlias,replyJson)
            return false
        }
    }
}

export async function processPublishResponse(chat: Object) {
    logger("roots - started publish DID alias",chat.fromAlias)
    startProcessing(chat.id,chat.fromAlias)
    const published = await publishPrismDid(chat.fromAlias);
    if(published) {
        endProcessing(chat.id,chat.fromAlias)
        const pubDid = getDid(chat.fromAlias)
        const didPubTx = getDidPubTx(pubDid[walletSchema.DID_ALIAS])
        const didPubMsg = await sendMessage(chat,PUBLISHED_TO_PRISM,
                PROMPT_OWN_DID_MSG_TYPE,rel.getRelItem(rel.PRISM_BOT),false,pubDid[walletSchema.DID_URI_LONG_FORM])
        const didLinkMsg = await sendMessage(chat,BLOCKCHAIN_URL_MSG,
                BLOCKCHAIN_URL_MSG_TYPE,rel.getRelItem(rel.PRISM_BOT),false,didPubTx.url)
        if(didLinkMsg) {
            //const didMsg = await sendMessage(chat,JSON.stringify(pubDid),DID_JSON_MSG_TYPE,rel.getRelItem(rel.PRISM_BOT),true);
            if(demo) {
                logger("roots - demo celebrating did publishing credential",pubDid[walletSchema.DID_URI_LONG_FORM])
                const vcMsg = await sendMessage(chat,
                    "To celebrate your published DID, a verifiable credential is being created for you.",
                    TEXT_MSG_TYPE,rel.getRelItem(rel.ROOTS_BOT))
                const credIssueAlias = await issueDemoCredential(chat, vcMsg.id)
                if(credIssueAlias) {
                    const credPubTx = getCredPubTx(pubDid[walletSchema.DID_ALIAS],credIssueAlias)
                    const credSuccess = await sendMessage(chat,"You have issued yourself a verifiable credential!",
                                     TEXT_MSG_TYPE,rel.getRelItem(rel.ROOTS_BOT))
                    const credLinkMsg = await sendMessage(chat,BLOCKCHAIN_URL_MSG,
                                    BLOCKCHAIN_URL_MSG_TYPE,rel.getRelItem(rel.PRISM_BOT),false,credPubTx.url)

                    if(credLinkMsg) {
                        logger("roots - demo credential issued",credIssueAlias)
                        const credReqMsg = await sendMessage(chat,
                            "Do you want to accept this verifiable credential",
                            PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE,rel.getRelItem(rel.ROOTS_BOT))
                        if(credReqMsg) {
                            const credAcceptAlias = getCredentialAlias(credReqMsg.id)
                            const cred = getIssuedCredential(credIssueAlias);
                            const credJson = JSON.stringify(cred.verifiedCredential)
                            logger("roots - cred request prepared",credAcceptAlias,credJson)
                            const savedCredReq = await store.saveItem(credAcceptAlias, credJson);
                            if(savedCredReq) {
                                logger("Successfully submitted demo cred req",credAcceptAlias,credJson)
                            }
                        }
                    }
                } else {
                    console.error("roots - unable to issue cred",chat,pubDid)
                }
            }
        }
        return chat
    } else {
        logger("roots - Could not process publish DID request",chat.id)
        const credReqMsg = await sendMessage(chat,
                            "DID was already added to Prism",
                            TEXT_MSG_TYPE,rel.getRelItem(rel.PRISM_BOT))
        return chat;
    }
}

// export async function processQuickReply(chat: Object,replies: Object[]) {
//     logger("roots - Processing Quick Reply w/ chat",chat.id,"w/ replies",replies.length)
//     if(replies && chat) {
//         replies.forEach(async (reply) =>
//         {
//             logger("roots - processing quick reply",chat.id,reply)
//             if(reply.value.startsWith(PROMPT_PUBLISH_MSG_TYPE)) {
//                 logger("roots - process quick reply to publish DID")
//                 if(reply.value.endsWith(PUBLISH_DID)) {
//                     logger("roots - publishing DID")
//                     return await processPublishResponse(chat,reply)
//                 } else {
//                     logger("roots - not publishing DID")
//                     return;
//                 }
//             } else if(reply.value.startsWith(PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE)) {
//                 logger("roots - process quick reply for accepting credential")
//                 return await processCredentialResponse(chat,reply)
//             } else {
//                 logger("roots - reply value not recognized, was",chat.id,reply.value)
//                 return;
//             }
//         });
//     } else {
//         logger("roots - reply",replies,"or chat",chat,"were undefined")
//         return;
//     }
// }

// ------------------ Credentials ----------

async function acceptCredential(chat: Object, msgId: string) {
    const credAlias = getCredentialAlias(msgId);
    const verCredJson = await store.getItem(credAlias);
    const verCred = JSON.parse(verCredJson)
    const credHash = verCred.proof.hash
    if (!getCredByHash(credHash)) {
        logger("roots - accepting credential",credAlias,verCredJson)
        const newWalJson = await PrismModule.importCred(store.getWallet(currentWal._id), credAlias, verCredJson);
        if(newWalJson) {
            const savedWal = await updateWallet(currentWal._id,currentWal.passphrase,newWalJson)
            if(savedWal) {
                const newCred = await getCredentialByMsgId(msgId)
                logger("Accepted credential",newCred.alias)
                return true
            } else {
                console.error("Could not accept credential, unable to save wallet",credAlias,credHash)
                return false
            }
        } else {
            console.error("Could not import accepted credential",credAlias,credHash)
            return false
        }
    } else {
        console.error("Credential alias already in use",credAlias,credHash)
        return false
    }
}

export function getCredByHash(credHash: string) {
    logger("roots - Getting imported credential",credHash)

    if(currentWal["importedCredentials"]) {
        const cred = currentWal["importedCredentials"].find(cred => {
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
            return cred
        }
    } else {
        logger("roots - No imported credential hash",credHash)
        return;
    }
}

function getCredentialAlias(msgId) {
    const alias = msgId.replace(models.MODEL_TYPE_MESSAGE,models.MODEL_TYPE_CREDENTIAL)
    logger("roots - generated credential alias",alias)
    return alias
}

export async function getCredentialByMsgId(msgId) {
    return await store.getItem(getCredentialAlias(msgId))
}

function getCredPubTx (didAlias: string, credAlias: string) {
    logger("roots - getting cred pub tx",didAlias)
    const txLogs = currentWal[walletSchema.WALLET_TX_LOGS]
    const txName = didAlias+"/"+credAlias
    logger("roots - got tx logs",txLogs,"searching for",txName)
    credPubTxLog = txLogs?.find(txLog => (txLog.action === walletSchema.CRED_ISSUE_TX && txLog.description === txName))
    logger("roots - got cred publish tx log",credPubTxLog)
    return credPubTxLog;
}

function getCredRequestAlias(msgId) {
    return msgId.replace(models.MODEL_TYPE_MESSAGE,models.MODEL_TYPE_CRED_REQUEST)
}

export function getIssuedCredential(credAlias) {
    logger("roots - getting issued credential",credAlias)

    if(currentWal["issuedCredentials"]) {
        const cred = currentWal["issuedCredentials"].find(cred => {
            if(cred["alias"] === credAlias) {
                logger("roots - Found alias",cred["alias"])
                return true
            }
            else {
                logger("roots - Alias",cred["alias"],"does not match",credAlias)
                return false
            }
        })
        if(cred) {
            logger("roots - got issued cred",cred)
            return cred
        }
    } else {
        logger("roots - No issued credential for",credAlias)
        return;
    }
}

export function getIssuedCredentials(didAlias: string) {
    logger("roots - Getting issued credentials",didAlias)
    const longDid = getDid(didAlias).uriLongForm
    if(currentWal["issuedCredentials"]) {
        const creds = currentWal["issuedCredentials"].filter(cred => {
            if(cred.claim.subjectDid === longDid) {
                logger("roots - Found alias",cred["alias"])
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

async function issueCredential(didAlias: string,credAlias: string,cred: Object) {
    const credJson = JSON.stringify(cred)
    console.log("roots - issuing credential", credJson)
    try {
        const newWalJson = await PrismModule.issueCred(store.getWallet(currentWal._id), didAlias, credJson);
        logger("roots - wallet after issuing credential",newWalJson)
        if(newWalJson) {
            const savedWal = await updateWallet(currentWal._id,currentWal.passphrase,newWalJson)
            if(savedWal) {
                logger("roots - wallet saved after issuing credential",savedWal)
                const newCred = getIssuedCredential(cred.alias)
                logger("roots - Issued credential",newCred.alias)
                return newCred
            } else {
                console.error("roots - Could not issue credential, unable to save wallet")
                return;
            }
        } else {
            console.error("roots - Could not issue credential")
            return;
        }
    } catch(error) {
        console.error("Could not issue credential to",didAlias,credAlias,cred,error,error.stack)
    }
}

function verifyCredential(credAlias: string) {
    //TODO fix gradle build problems so that we can verify.
    logger("Verifying credential not implemented yet",credAlias)
    //const errorArray = JSON.parse(PrismModule.verifyCred(credAlias))
//     logger("Credential verification not implemented yet",credAlias,errorArray)
}

// ------------------ Session ---------------
const sessionInfo={};
const sessionState=[];
export function startChatSession(sessionInfo) {
    logger("roots - starting session w/chat",sessionInfo["chat"].title);
    if(sessionInfo["onReceivedMessage"]) {
        logger("roots - setting onReceivedMessage")
        handlers["onReceivedMessage"] = sessionInfo["onReceivedMessage"]
    }
    if(sessionInfo["onTypingStarted"]){
        logger("roots - setting onTypingStarted")
        handlers["onTypingStarted"] = sessionInfo["onTypingStarted"]
    }
    if(sessionInfo["onProcessing"]) {
        logger("roots - setting onProcessing")
        handlers["onProcessing"] = sessionInfo["onProcessing"]
    }

    const status = {
        succeeded: "session succeeded",
        end: "session ended",
    }

    return status;
}

//----------- Processing -------------

export function startProcessing(processGroup, processAlias) {
    logger("starting processing",processGroup,processAlias)
    if(!allProcessing[processGroup]) {
        allProcessing[processGroup] = {}
    }
    allProcessing[processGroup][processAlias] = {startDate: Date.now()}
    logger("started processing",processGroup,processAlias,allProcessing[processGroup][processAlias])
    if(handlers["onProcessing"]) {
        handlers["onProcessing"](isProcessing(processGroup))
    }
}

export function endProcessing(processGroup, processAlias) {
    logger("ending processing",processGroup,processAlias)
    if(!allProcessing[processGroup]) {
        console.error("Cannot end processing in group that does not exist",processGroup)
    } else if(!allProcessing[processGroup][processAlias]) {
        console.error("Cannot end processing of id that does not exist",processAlias)
    } else {
        logger("Ending processing",processGroup,processAlias)
        allProcessing[processGroup][processAlias]={endDate: Date.now()}
    }
    if(handlers["onProcessing"]) {
        handlers["onProcessing"](isProcessing(processGroup))
    }
}

function isActiveProcess(processGroup: string,processAlias: string) {
    const endDate = allProcessing[processGroup][processAlias]["endDate"]
    const isActive = (!endDate || endDate.length <= 0)
    logger("is process active?",processGroup,processAlias,isActive)
    return isActive
}

function getActiveProcesses(processGroup: string) {
    const allActive = []
//     if(!processGroup) {
//         logger("getting all active processing groups")
//         const allGroups = Object.keys(allProcessing)
//         allGroups.forEach(group => {allActive.concat(getActiveProcesses(group))})
//     } else {
        logger("getting active processing for group",processGroup)
        if(allProcessing[processGroup]) {
            const allGroupProcesses = Object.keys(allProcessing[processGroup])
            active = allGroupProcesses.map(processAlias => {
                    if(isActiveProcess(processGroup,processAlias)) {
                        return allProcessing[processGroup][processAlias]
                    }
                }
            );
            allActive.push(active)
        }
//     }
    return allActive
}

export function isProcessing(processGroup) {
    logger("determining if is processing",processGroup)
    const active = getActiveProcesses(processGroup)
    if(active && active.length > 0){
        logger("is processing",active.length)
        return true;
    } else {
        logger("signaling not processing")
        return false;
    }
}

//----------- DEMO --------------------

export async function issueDemoCredential(chat: Object,msgId: string) {
    logger("roots - Trying to create demo credential for chat",chat.id,msgId)
    const credMsgs = []
    const credAlias = getCredentialAlias(msgId)
    const alreadyIssued = getIssuedCredential(credAlias)
    const did = getDid(chat.fromAlias)
    const didPub = isDidPublished(did)
    if(didPub && !alreadyIssued) {
        logger("roots - Chat is published and credential not found, creating....")
        const didLong = did[walletSchema.DID_URI_LONG_FORM]
        logger("roots - Creating demo credential for chat",chat.id,"w/long form did",didLong)
        const cred = {
            alias: credAlias,
            issuingDidAlias: chat.fromAlias,
            claim: {
                content: "{\"name\": \"RootsWallet\",\"degree\": \"law\",\"date\": \"2022-04-04 09:10:04\"}",
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
        logger("roots - issuing demo credential",cred)
        startProcessing(chat.id,credAlias)
        const issuedCred = await issueCredential(chat.fromAlias, credAlias, cred)
        if(issuedCred) {
            endProcessing(chat.id,credAlias)
            logger("Prism issued credential",issuedCred)
            return credAlias;
        } else {
            logger("Could not issue Prism credential")
            return false;
        }
    } else {
        logger("roots - Couldn't issue demo credential, is the chat published",
            didPub,"was the credential already found",alreadyIssued)
        return false
    }
//        sendMessage(chat,"Valid credential",
//                      STATUS_MSG_TYPE,
//                      rel.getRelDisplay(rel.ROOTS_BOT))
//
//
//        sendMessage(chat,"Credential imported"
//                    STATUS_MSG_TYPE,
//                    rel.getRelDisplay(rel.ROOTS_BOT))
//        sendMessage(chat,"Valid credential.",
//                      STATUS_MSG_TYPE,
//                      rel.getRelDisplay(rel.ROOTS_BOT))
    //    sendMessage(chat,"https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=0ce00bc602ef54dfc52b4106bebcafb72c2447bdf666cd609d50fd3a7e9d2474",
    //                 BLOCKCHAIN_URI_MSG_TYPE,
    //                 rel.getRelDisplay(rel.PRISM_BOT))
//        sendMessage(chat,"Credential revoked",
//                      STATUS_MSG_TYPE,
//                      rel.getRelDisplay(rel.ROOTS_BOT))
//        sendMessage(chat,"Invalid credential.",
//                    STATUS_MSG_TYPE,
//                    rel.getRelDisplay(rel.ROOTS_BOT))
}

async function initDemos(fromDidAlias) {
    //const libraryRoot = await initRoot("libraryRoot", fromDidAlias, rootsDid("library"), "Library")
    //const rentalRoot = await initRoot("rentalRoot", fromDidAlias, rootsDid("vacationRental"), "Vacation Rental")
    //return libraryRoot && rentalRoot;
    return true;
}

async function initDemoAchievements(chat: Object) {


    await sendMessage(achieveCh,ACHIEVEMENT_MSG_PREFIX+"Opened RootsWallet!",
      STATUS_MSG_TYPE,
      rel.getRelItem(rel.ROOTS_BOT))
    await sendMessage(achieveCh,"{subject: you,issuer: RootsWallet,credential: Opened RootsWallet}",
      CREDENTIAL_JSON_MSG_TYPE,
      rel.getRelItem(rel.ROOTS_BOT))
    await sendMessage(achieveCh,ACHIEVEMENT_MSG_PREFIX+"Clicked Example!",
      STATUS_MSG_TYPE,
      rel.getRelItem(rel.ROOTS_BOT))
    await sendMessage(achieveCh,"{subject: you,issuer: RootsWallet,credential: Clicked Example}",
      CREDENTIAL_JSON_MSG_TYPE,
      rel.getRelItem(rel.ROOTS_BOT))
}

export async function initRoot(alias: string, fromDidAlias: string, toDid: string, display=alias, avatar=rel.personLogo) {
    logger("roots - creating root",alias,fromDidAlias,toDid,display,avatar)
    try {
        const relCreated = await rel.createRelItem(alias,display, avatar, toDid);
        logger("roots - rel created/existed?",relCreated)
        const relationship = rel.getRelItem(alias)
        logger("roots - creating chat for rel",relationship.id)
        //toDid: string, fromDidAliasAlias: string, myRel: Object, title: string
        const chat = await createChat(alias,fromDidAlias,toDid,display)
        return true;
    } catch(error) {
        console.error("Failed to initRoot",error,error.stack)
        return false;
    }
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

//export var walCommandsMsgs =  walCliMsgs.reduce(function(result, message, index) {
//  result.push(message);
//  result[index]["command"]=walCliCommands[index];
//  result[index]["id"]="walCli"+index
//  return result;
//}, []);

function rootsDid(alias: string) {
    return "did:root:"+replaceSpecial(alias);
}