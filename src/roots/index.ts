import * as models from '../models'
import { logger } from '../logging'
import PrismModule from '../prism'
import { Reply } from 'react-native-gifted-chat';
import * as store from '../store'
import * as walletSchema from '../schemas/WalletSchema'
//import QRCode from 'qrcode'

import rwLogo from '../assets/LogoOnly1024.png'
import perLogo from '../assets/smallBWPerson.png'
import apLogo from '../assets/ATALAPRISM.png'
//https://lh5.googleusercontent.com/bOG9vTJDA73jNwAtwm1ioc__Nr1Ch199Xo-4R9xFgJW_hsMsNwef2WQCwm-8_c9d3B8zF7vSEF5E-nLIMOOaZJlPz_dKAo-j_s102ddaNla0iiywfT2fAljxrsdrkxDllg=w1280
//https://lh5.googleusercontent.com/iob7iL2ixIzrP24PvQVJjpnmt3M2HvJIS7E3mIg2qWRMIJIlnIo27qjAS4XL9tC3ZwhZ78sbpwygbK2hDjx-8z2u_WaunTLxpEFgHJngBljvF8VvJ3QoAiyVfjEmthEEWQ=w1280
export const rootsLogo = rwLogo;
export const personLogo = perLogo;
export const prismLogo = apLogo;

//msg types
export const BLOCKCHAIN_URI_MSG_TYPE = "blockchainUri";
export const CREDENTIAL_JSON_MSG_TYPE = "jsonCredential";
export const DID_JSON_MSG_TYPE = "jsonDid";
export const PENDING_STATUS_MESSAGE = "rootsPendingStatus";
export const PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE = "rootsAcceptCredential"
export const PROMPT_PUBLISH_MSG_TYPE = "promptPublish";
export const PRISM_LINK_MSG_TYPE = "prismLink"
export const STATUS_MSG_TYPE = "status";
export const TEXT_MSG_TYPE = "text"

//meaningful literals
export const ACHIEVEMENT_MSG_PREFIX = "You have a new achievement: ";
export const PUBLISHED_TO_PRISM = "published to Prism"

//state literals
export const CRED_ACCEPTED = "credAccepted"
export const CRED_REJECTED = "credRejected"
export const CRED_SENT = "credSent"

const ID_SEPARATOR = "_"

const allChatsRegex = new RegExp('^'+getStorageKey("",models.MODEL_TYPE_CHAT)+'*')
//const allCredsRegex = new RegExp('^'+getStorageKey("",models.MODEL_TYPE_CREDENTIAL)+'*')
const allCredReqsRegex = new RegExp('^'+getStorageKey("",models.MODEL_TYPE_CRED_REQUEST)+'*')
const allMsgsRegex = new RegExp('^'+getStorageKey("",models.MODEL_TYPE_MESSAGE)+'*')
const allUsersRegex = new RegExp('^'+getStorageKey("",models.MODEL_TYPE_USER)+'*')

const ROOTS_BOT = "RootsWalletBot1"
const PRISM_BOT = "PrismBot1"
const LIBRARY_BOT = "LibraryBot1"

export const TEST_WALLET_NAME = "testWalletName"
const demo = true;

let currentWal;

const handlers = {};
const allProcessing = [];

export async function loadAll(walName: string,walPass: string) {
    const wallet = await loadWallet(walName, walPass);
    if(wallet) {
        const chats = await loadItems(allChatsRegex)
        const users = await loadItems(allUsersRegex);
        const messages = await loadItems(allMsgsRegex);
        const credRequests = await loadItems(allCredReqsRegex);
        //const creds = await loadItems(allCredsRegex);
        if(wallet && chats && users && messages && credRequests) {
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

//----------------- User -----------------
//TODO unify aliases and storageKeys?
async function createUserItem(alias: string, name: string, pic: string) {
    try {
        if(getUserItem(alias)) {
            logger("roots - user already exists",alias)
            return true;
        } else {
            logger("roots - user did not exist",alias)
            const userItem = models.createUser(alias, name, pic)
            const userItemJson = JSON.stringify(userItem)
            logger("generated user",userItemJson)
            const result = await store.saveItem(getStorageKey(alias, models.MODEL_TYPE_USER), userItemJson)
            logger("roots - created user",alias,"?",result)
            return result;
        }
    } catch(error) {
        console.error("Failed to create user",alias,error,error.stack)
        return false
    }
}

export function getUserItem(userId) {
    logger("roots - Getting user",userId)
    const userItemJson = store.getItem(getStorageKey(userId,models.MODEL_TYPE_USER));
    logger("roots - Got user json",userItemJson)
    if(userItemJson) {
        const userItem = JSON.parse(userItemJson)
        logger("roots - user w/keys",Object.keys(userItem))
        return userItem
    } else {
        logger("roots - user not found",userId)
        return userItemJson
    }
}

async function loadUsers() {
    try {
        const aliases = getAllDidAliases(currentWal);
        const result = await store.restoreItems(getStorageKeys(aliases,models.MODEL_TYPE_USER));
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
        if(getDid(didAlias)) {
            logger("roots - Chat/DID already exists",didAlias)
            return true;
        } else {
            logger("roots - DID does not exist, creating",didAlias)
            const walletJson = store.getWallet(currentWal._id)
            logger("roots - requesting chat/did from prism, w/wallet",walletJson)
            const prismWalletJson = PrismModule.newDID(walletJson,didAlias)
            logger("roots - Chat/prismDid added to wallet", prismWalletJson)
            const saveResult = await updateWallet(currentWal._id,currentWal.passphrase,prismWalletJson)
            return saveResult;
        }
    } catch(error) {
        console.error("Failed to create chat DID",error,error.stack)
        return false
    }
}

function getDid(didAlias) {
    logger("roots - getDid by alias",didAlias)
    const dids = currentWal[walletSchema.WALLET_DIDS];
    if(dids) {
        logger("roots - current dids",dids)
        const findDid = dids.find(did => (did[walletSchema.DID_ALIAS] === didAlias));
        if(findDid) {
            logger("roots -  found did alias",didAlias,"w/keys:",findDid)
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

//------------------ Chats  --------------
export async function createChat (chatAlias, titlePrefix) {
    logger("roots - Creating chat",chatAlias,"w/ titlePrefix",titlePrefix)
    const chatDidCreated = await createDid(chatAlias)
    logger("roots - chat DID created/existed?",chatDidCreated)
    const chatDid = getDid(chatAlias)
    logger("roots - chat DID",chatDid)
    //should be the same as chat alias, eating our own dog food
    const chatDidAlias = chatDid[walletSchema.DID_ALIAS]
    const chatItemCreated = await createChatItem(chatDidAlias, titlePrefix)
    logger("roots - chat item created/existed?",chatItemCreated)
    const chatItem = getChatItem(chatDidAlias)
    logger("roots - chat item",chatItem)
    //TODO what should the user defaults be?
    const chatUserCreated = await createUserItem(chatDidAlias,"You",personLogo)
    logger("roots - chat user created/existed?",chatUserCreated)
    const chatUser = getUserItem(chatDidAlias)

    if(chatDidCreated && chatItemCreated && chatUserCreated) {
        const sentWelcome = await sendMessage(chatItem,"Welcome to *"+chatAlias+"*",TEXT_MSG_TYPE,getUserItem(ROOTS_BOT))
        if(sentWelcome) {
            await sendMessage(chatItem,"Would you like to publish this chat to Prism?",
                PROMPT_PUBLISH_MSG_TYPE,getUserItem(PRISM_BOT))
            logger("Created chat and added welcome to chat",chatAlias,"with chatDid",chatDidAlias)
        }
        return true;
    } else {
        console.error("Could not create chat",chatAlias);
        return false
    }
}

//TODO unify aliases and storageKeys?
async function createChatItem(chatAlias: string, titlePrefix: string) {
    logger('roots - Creating a new chat item',chatAlias)
    if(getChatItem(chatAlias)) {
        logger('roots - chat item already exists',chatAlias)
        return true
    } else {
        const chatItem = models.createChat(chatAlias, [], titlePrefix)
        const savedChat = await store.saveItem(getStorageKey(chatAlias, models.MODEL_TYPE_CHAT), JSON.stringify(chatItem))
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
    if(allChats.length == 0 && demo) {
        logger("roots - adding demo to chats")
        await initDemo()
    }
    const result = {paginator: {items: allChats}};
    result.paginator.items.forEach(function (item, index) {
        logger("roots - getting chats",index+".",item.id);
    });
    return result;
}

export function getChatItem(chatAlias: string) {
    logger("roots - getting chat item",chatAlias)
    const chatJson = store.getItem(getStorageKey(chatAlias,models.MODEL_TYPE_CHAT))
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
        const result = await store.restoreItems(getStorageKeys(aliases,models.MODEL_TYPE_CHAT));
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
export async function publishChat(chat: Object) {
    if(!chat["published"]) {
        logger("roots - Publishing DID",chat.id,"to Prism")
        isProcessing(true)
        try {
            const newWalJson = await PrismModule.publishDid(store.getWallet(currentWal._id), chat.id)
            const result = await updateWallet(currentWal._id,currentWal.passphrase,newWalJson)
            if(result) {
                logger("roots - published DID for chat, saving chat...",chat.id)
                chat["published"]=true
                chat["title"]=chat.title+"🔗"
                const savedChat = await updateChat(chat);
                if(savedChat) {
                    logger("Chat for published DID saved",chat.id)
                    isProcessing(false)
                    return chat
                } else {
                    //TODO since wallet is updated, should try to save chat again and again until successful
                    logger("Could not save chat for published DID",chat.id)
                    isProcessing(false)
                    return;
                }
            } else {
                logger("roots - During publish, could not update wallet")
                isProcessing(false)
                return;
            }
        } catch(error) {
            logger("roots - Error publishing chat/DID",chat.id,error,error.stack)
            isProcessing(false)
        }
    } else {
        logger("roots - ",chat.id,"is already",PUBLISHED_TO_PRISM)
        return;
    }
}

async function updateChat(chat: Object) {
    const chatStoreId = getStorageKey(chat.id,models.MODEL_TYPE_CHAT);
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

function createMessageId(chatAlias: string,userId: string,msgNum: number) {
    let msgId = getStorageKey(chatAlias,models.MODEL_TYPE_MESSAGE)+ID_SEPARATOR+userId+ID_SEPARATOR+String(msgNum);
    logger("roots - Generated msg id",msgId);
    return msgId;
}

export function getMessages(chatAlias: string, startFromMsgId?: string) {
    const chMsgs = getMessageItems(chatAlias)
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

export function getMessageItems(chatAlias: string) {
    logger("roots - getting message items for chat",chatAlias)
    const msgRegex = new RegExp('^'+getStorageKey(chatAlias,models.MODEL_TYPE_MESSAGE)+'*')
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

export async function sendMessages(chat,msgs,msgType,userDisplay) {
    msgs.map(async (msg) => await sendMessage(chat,msg.text,msgType,userDisplay))
}

//TODO unify aliases and storageKeys?
export async function sendMessage(chat,msgText,msgType,userDisplay,system=false) {
    const msgTime = Date.now()
    logger("roots - user",userDisplay.id,"sending",msgText,"to chat",chat.id);
    const msgId = createMessageId(chat.id,userDisplay.id,msgTime);
    let msg = models.createMessage(msgId, msgText, msgType, msgTime, userDisplay.id, system);
    msg = addMessageExtensions(msg);
    try {
        const result = await store.saveItem(msg.id,JSON.stringify(msg))
        if(handlers["onReceivedMessage"]) {
            handlers["onReceivedMessage"](msg)
        }
        return msg
    } catch(error) {
        console.error("Could not save message for user",userDisplay.id,"w/msg",msgText,"to chat",chat.id,error,error.stack)
        return;
    }
}

function addQuickReply(msg) {
    if(msg.type === PROMPT_PUBLISH_MSG_TYPE) {
        msg["quickReplies"] = {type: 'checkbox',keepIt: true,
            values: [{
                title: 'Yes',
                value: PROMPT_PUBLISH_MSG_TYPE,
                messageId: msg.id,
            }],
        }
    }
    if(msg.type === PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE) {
        msg["quickReplies"] = {
            type: 'checkbox',
            keepIt: true,
            values: [{
                title: 'Yes',
                value: PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE+CRED_ACCEPTED,
                messageId: msg.id,},
            {
                title: 'No Thx!',
                value: PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE+CRED_REJECTED,
                messageId: msg.id,
            }],
        }
    }
    return msg
}

async function processCredentialResponse(chat: Object, reply: Object) {
    logger("roots - Quick reply credential",chat.id,reply)
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
            const accepted = await acceptCredential(chat, reply)
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

async function processPublishResponse(chat: Object, reply: Reply) {
    logger("roots - Quick reply, started publsih chat",chat.id)
    const pubChat = await publishChat(chat);
    if(pubChat) {
        const linkMsg = await sendMessage(pubChat,pubChat.id+" "+PUBLISHED_TO_PRISM+"\nhttps://explorer.cardano-testnet.iohkdev.io/en/transaction?id=0ce00bc602ef54dfc52b4106bebcafb72c2447bdf666cd609d50fd3a7e9d2474",
                TEXT_MSG_TYPE,getUserItem(PRISM_BOT))
        if(linkMsg) {
            const didMsg = await sendMessage(chat,JSON.stringify(getDid(chat.id)),DID_JSON_MSG_TYPE,getUserItem(PRISM_BOT),true);
            if(demo && didMsg) {
                const confirmPubMsg = await sendMessage(chat,
                    "You published your chat to Prism!",
                    STATUS_MSG_TYPE,getUserItem(ROOTS_BOT))
                if(confirmPubMsg && demo) {
                    await sendMessage(chat,
                        "To celebrate your publishing achievement, can we send you a verifiable credential?",
                        PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE,getUserItem(ROOTS_BOT))
                }
            }
        }
        return pubChat
    } else {
        logger("roots - Could not process quick reply to publish chat",chat.id)
        return;
    }
}

export async function processQuickReply(chat: Object,replies: Object[]) {
    logger("roots - Processing Quick Reply w/ chat",chat.id,"w/ replies",replies.length)
    if(replies && chat) {
        replies.forEach(async (reply) =>
        {
            logger("roots - processing quick reply",chat.id,reply)
            if(reply.value === PROMPT_PUBLISH_MSG_TYPE) {
                logger("roots - process quick reply to publish DID")
                return await processPublishResponse(chat,reply)
            } else if(reply.value.startsWith(PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE)) {
                logger("roots - process quick reply for credential")
                return await processCredentialResponse(chat,reply)
            }
             else {
                logger("roots - reply value not recognized, was",chat.id,reply.value)
                return;
            }
        });
    } else {
        logger("roots - reply",replies,"or chat",chat,"were undefined")
        return;
    }
}

// ------------------ Credentials ----------

async function acceptCredential(chat: Object, reply: Object) {
    if(demo) {
        await createDemoCredential(chat, reply)
    } else {
        //TODO accept non-demo credentials
    }
}

async function createCredential(chat: Object,credAlias: string,cred: Object) {
    const credJson = JSON.stringify(cred)
    logger("roots - issuing credential", credJson)
    isProcessing(true)
    const newWalJson = await PrismModule.issueCred(store.getWallet(currentWal._id), chat.id, credJson);
    if(newWalJson) {
        const savedWal = await updateWallet(currentWal._id,currentWal.passphrase,newWalJson)
        if(savedWal) {
            //const saveCred = await saveCred(cred.alias)
            const credIssuedMsg = await sendMessage(chat,"Your new credential has been " + PUBLISHED_TO_PRISM+"\nhttps://explorer.cardano-testnet.iohkdev.io/en/transaction?id=0ce00bc602ef54dfc52b4106bebcafb72c2447bdf666cd609d50fd3a7e9d2474",
                  STATUS_MSG_TYPE,
                  getUserItem(ROOTS_BOT))
            //const code = await QRCode.toDataURL()
            if(credIssuedMsg) {
                const credJsonMsg = await sendMessage(chat,JSON.stringify(getCredential(cred.alias)),
                    CREDENTIAL_JSON_MSG_TYPE,
                    getUserItem(PRISM_BOT),true)
                isProcessing(false)
                return true
            } else {
                console.warn("Unable to send confirmation msg after issuing cred")
                isProcessing(false)
                return true
            }
        } else {
            console.error("Could not create/issue credential, unable to save wallet")
            isProcessing(false)
            return false
        }
    } else {
        console.error("Could not create/issue credential")
        isProcessing(false)
        return false
    }
}

function getCredential(credAlias) {
    logger("roots - Getting credential",credAlias)

    if(currentWal["issuedCredentials"]) {
        creds = currentWal["issuedCredentials"].filter(cred => {
            if(cred["alias"] === credAlias) {
                logger("roots - Found alias",cred["alias"])
                return true
            }
            else {
                logger("roots - Alias",cred["alias"],"is not",credAlias)
                return false
            }
        })
        if(creds && creds.length > 0) {
            return creds[0]
        }
    } else {
        logger("roots - No issued credentials")
    }
    return;
}

function getCredentialAlias(msgId) {
    return getStorageKey(msgId,models.MODEL_TYPE_CREDENTIAL)
}

function getCredRequestAlias(msgId) {
    return getStorageKey(msgId,models.MODEL_TYPE_CRED_REQUEST)
}
//---------------- Keys -----------------------

function getStorageKey(alias: string,type: string) {
    return type+ID_SEPARATOR+alias
}

function getStorageKeys(aliases: string[], type: string) {
    return aliases.map(alias => getStorageKey(alias,type))
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

//----------- Events -------------

export function isProcessing(processing=false) {
    if(processing){
        allProcessing.push(processing)
    } else if(allProcessing.length > 0) {
        allProcessing.pop()
    }
    console.log("Signaling processing of",(allProcessing.length > 0))
    handlers["onProcessing"](allProcessing.length > 0)
    return allProcessing.length > 0
}

//----------- DEMO Stuff --------------------

export async function createDemoCredential(chat: Object,reply: Object) {
    logger("roots - Trying to create demo credential for chat",chat.id,reply)
    const credMsgs = []
    const credAlias = getCredentialAlias(reply.messageId)
    if(chat["published"] && !getCredential(credAlias)) {
        logger("roots - Chat is published and credential not found, creating....")
        const didLong = getDid(chat.id)[walletSchema.DID_URI_LONG_FORM]
        logger("roots - Creating demo credential for chat",chat.id,"w/long form did",didLong)
        const cred = {
            alias: credAlias,
            issuingDidAlias: chat.id,
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
        return await createCredential(chat, credAlias, cred)
    } else {
        logger("roots - Couldn't create demo credential, is the chat published",chat["published"],"was the credential already found",getCredential(credAlias))
        return false;
    }
//        sendMessage(chat,"Valid credential",
//                      STATUS_MSG_TYPE,
//                      getUserDisplay(ROOTS_BOT))
//
//
//        sendMessage(chat,"Credential imported",
//                    STATUS_MSG_TYPE,
//                    getUserDisplay(ROOTS_BOT))
//        sendMessage(chat,"Valid credential.",
//                      STATUS_MSG_TYPE,
//                      getUserDisplay(ROOTS_BOT))
    //    sendMessage(chat,"https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=0ce00bc602ef54dfc52b4106bebcafb72c2447bdf666cd609d50fd3a7e9d2474",
    //                 BLOCKCHAIN_URI_MSG_TYPE,
    //                 getUserDisplay(PRISM_BOT))
//        sendMessage(chat,"Credential revoked",
//                      STATUS_MSG_TYPE,
//                      getUserDisplay(ROOTS_BOT))
//        sendMessage(chat,"Invalid credential.",
//                    STATUS_MSG_TYPE,
//                    getUserDisplay(ROOTS_BOT))
}

async function initDemo() {
    const users = await initDemoUserDisplays()
    const intro = await initDemoIntro()
//    const achievements = await initDemoAchievements()
//    const library = await initDemoLibrary()
//    const resume = await initDemoResume()
    const result = (users && intro)
    return result;
}

async function initDemoAchievements() {
    const achieveCh = await createChat("Achievement Chat","Under Construction - ")

    await sendMessage(achieveCh,ACHIEVEMENT_MSG_PREFIX+"Opened RootsWallet!",
      STATUS_MSG_TYPE,
      getUserItem(ROOTS_BOT))
    await sendMessage(achieveCh,"{subject: you,issuer: RootsWallet,credential: Opened RootsWallet}",
      CREDENTIAL_JSON_MSG_TYPE,
      getUserItem(ROOTS_BOT))
    await sendMessage(achieveCh,ACHIEVEMENT_MSG_PREFIX+"Clicked Example!",
      STATUS_MSG_TYPE,
      getUserItem(ROOTS_BOT))
    await sendMessage(achieveCh,"{subject: you,issuer: RootsWallet,credential: Clicked Example}",
      CREDENTIAL_JSON_MSG_TYPE,
      getUserItem(ROOTS_BOT))
}

async function initDemoIntro() {
    logger("roots - Init demo intro");
    const chat = await createChat("Introduction Chat","Under Construction - ")
}

async function initDemoLibrary() {
    const libraryCh = await createChat("Library Chat","Coming Soon - ")
}

async function initDemoResume() {
    const resumeCh = await createChat("Resume/CV Chat","Coming Soon - ")
}

async function initDemoUserDisplays() {
    await createUserItem(ROOTS_BOT,
                  "RootsWallet",
                  rootsLogo)
    await createUserItem(PRISM_BOT,
                  "Atala Prism",
                  prismLogo)
    await createUserItem(
                  LIBRARY_BOT,
                  "Library",
                  personLogo)
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