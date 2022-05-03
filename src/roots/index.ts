import * as models from '../models'
import { logger } from '../logging'
import PrismModule from '../prism'
import { Reply } from 'react-native-gifted-chat';
import * as store from '../store'
import * as rel from '../relationships'
import * as walletSchema from '../schemas/WalletSchema'

import rwLogo from '../assets/LogoOnly1024.png'
import perLogo from '../assets/smallBWPerson.png'
import apLogo from '../assets/ATALAPRISM.png'
export const rootsLogo = rwLogo;
export const personLogo = perLogo;
export const prismLogo = apLogo;

//msg types
export const BLOCKCHAIN_URI_MSG_TYPE = "blockchainUri";
export const CREDENTIAL_JSON_MSG_TYPE = "jsonCredential";
export const DID_JSON_MSG_TYPE = "jsonDid";
export const PENDING_STATUS_MESSAGE = "rootsPendingStatus";
export const PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE = "rootsAcceptCredential"
export const PROMPT_OWN_CREDENTIAL_MSG_TYPE = "rootsOwnCredential"
export const PROMPT_PUBLISH_MSG_TYPE = "rootsPromptPublish";
export const PRISM_LINK_MSG_TYPE = "rootsPrismLink"
export const QR_CODE_MSG_TYPE = "rootsQRCodeMsgType"
export const STATUS_MSG_TYPE = "status";
export const TEXT_MSG_TYPE = "text"

//meaningful literals
export const ACHIEVEMENT_MSG_PREFIX = "You have a new achievement: ";
export const PUBLISHED_TO_PRISM = "Published to Prism"
export const SHOW_CRED_QR_CODE = "Show Cred QR code"
export const SHOW_DID_QR_CODE = "Show Chat QR code"

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
const allRelsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_REL)+'*')

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
        const rels = await loadItems(allRelsRegex);
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

export function getDid(didAlias) {
    logger("roots - getDid by alias",didAlias)
    const dids = currentWal[walletSchema.WALLET_DIDS];
    if(dids) {
        logger("roots - # of current dids",dids.length)
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
    //TODO what should the rel defaults be?
    const chatRelCreated = await rel.createRelItem(chatDidAlias,"You",personLogo)
    logger("roots - chat rel created/existed?",chatRelCreated)
    const chatRel = rel.getRelItem(chatDidAlias)

    if(chatDidCreated && chatItemCreated && chatRelCreated) {
        const sentWelcome = await sendMessage(chatItem,"Welcome to *"+chatAlias+"*",TEXT_MSG_TYPE,rel.getRelItem(ROOTS_BOT))
        if(sentWelcome) {
            await sendMessage(chatItem,"Would you like to publish this chat to Prism?",
                PROMPT_PUBLISH_MSG_TYPE,rel.getRelItem(PRISM_BOT))
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
export async function publishChat(chat: Object) {
    if(!chat["published"]) {
        logger("roots - Publishing DID",chat.id,"to Prism")
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
                    return chat
                } else {
                    //TODO since wallet is updated, should try to save chat again and again until successful
                    logger("Could not save chat for published DID",chat.id)
                    return;
                }
            } else {
                logger("roots - During publish, could not update wallet")
                return;
            }
        } catch(error) {
            logger("roots - Error publishing chat/DID",chat.id,error,error.stack)
        }
    } else {
        logger("roots - ",chat.id,"is already",PUBLISHED_TO_PRISM)
        return;
    }
}

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

export async function sendMessages(chat,msgs,msgType,relDisplay) {
    msgs.map(async (msg) => await sendMessage(chat,msg.text,msgType,relDisplay))
}

//TODO unify aliases and storageKeys?
export async function sendMessage(chat,msgText,msgType,relDisplay,system=false,cred=undefined) {
    const msgTime = Date.now()
    logger("roots - rel",relDisplay.id,"sending\"",msgText,"\"to chat:",chat.id);
    const msgId = models.createMessageId(chat.id,relDisplay.id,msgTime);
    let msg = models.createMessage(msgId, msgText, msgType, msgTime, relDisplay.id, system, cred);
    msg = addMessageExtensions(msg);
    try {
        const msgJson = JSON.stringify(msg)
        const result = await store.saveItem(msg.id,msgJson)
        if(handlers["onReceivedMessage"]) {
            handlers["onReceivedMessage"](msg)
        }
        logger("Sent/Stored message",msgJson)
        return msg
    } catch(error) {
        console.error("Could not save message for rel",relDisplay.id,"w/msg",msgText,"to chat",chat.id,error,error.stack)
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
            },
            {
                title: 'Keep private',
                value: PROMPT_PUBLISH_MSG_TYPE+DO_NOT_PUBLISH_DID,
                messageId: msg.id,
            }
            ],
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
            {
                title: 'Reject',
                value: PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE+CRED_REJECTED,
                messageId: msg.id,
            }
            ],
        }
    }
    if(msg.type === PROMPT_OWN_CREDENTIAL_MSG_TYPE) {
        msg["quickReplies"] = {
            type: 'checkbox',
            keepIt: true,
            values: [{
                title: 'Verify',
                value: PROMPT_OWN_CREDENTIAL_MSG_TYPE+CRED_VERIFY,
                messageId: msg.id,
            },
            {
                title: 'View',
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
            isProcessing(true)
            const accepted = await acceptCredential(chat, reply)
            if(accepted) {
                const credOwnMsg = await sendMessage(chat,"Credential accepted.",PROMPT_OWN_CREDENTIAL_MSG_TYPE,rel.getRelItem(ROOTS_BOT))
                store.saveItem(getCredentialAlias(credOwnMsg.id),await getCredentialByMsgId(reply.messageId))
            }
            isProcessing(false)
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

export async function processPublishResponse(chat: Object, reply: Reply) {
    logger("roots - Quick reply, started publsih chat",chat.id)
    isProcessing(true)
    const pubChat = await publishChat(chat);
    isProcessing(false)
    if(pubChat) {
        const linkMsg = await sendMessage(pubChat,"Your chat \""+pubChat.id+"\" has been"
                +"\t\t"+PUBLISHED_TO_PRISM+"\t\t"+SHOW_DID_QR_CODE
                +"\nhttps://explorer.cardano-testnet.iohkdev.io/en/transaction?id=0ce00bc602ef54dfc52b4106bebcafb72c2447bdf666cd609d50fd3a7e9d2474",
                TEXT_MSG_TYPE,rel.getRelItem(PRISM_BOT))

        if(linkMsg) {
            const didMsg = await sendMessage(chat,JSON.stringify(getDid(chat.id)),DID_JSON_MSG_TYPE,rel.getRelItem(PRISM_BOT),true);
            if(demo && didMsg) {
                logger("roots - quick reply demo celebrating with credential",chat.id)
                await sendMessage(chat,
                    "To celebrate your publishing achievement a verifiable credential is being created for you.",
                    TEXT_MSG_TYPE,rel.getRelItem(ROOTS_BOT))
                const cred = await issueDemoCredential(chat, reply)
                logger("roots - quick reply demo credential issued",cred)
                const credReqMsg = await sendMessage(chat,
                    "Do you want to accept this verifiable credential",
                    PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE,rel.getRelItem(ROOTS_BOT))
                if(credReqMsg) {
                    const credAlias = getCredentialAlias(credReqMsg.id)
                    const credJson = JSON.stringify(cred.verifiedCredential)
                    logger("roots - cred request prepared",credAlias,credJson)
                    const savedCredReq = await store.saveItem(credAlias, credJson);
                    if(savedCredReq) {
                        logger("Successfully submitted demo cred req",credAlias,credJson)
                    }
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
            if(reply.value.startsWith(PROMPT_PUBLISH_MSG_TYPE)) {
                logger("roots - process quick reply to publish DID")
                if(reply.value.endsWith(PUBLISH_DID)) {
                    logger("roots - publishing DID")
                    return await processPublishResponse(chat,reply)
                } else {
                    logger("roots - not publishing DID")
                    return;
                }
            } else if(reply.value.startsWith(PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE)) {
                logger("roots - process quick reply for accepting credential")
                return await processCredentialResponse(chat,reply)
            } else {
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
    const credAlias = getCredentialAlias(reply.messageId);
    const verCredJson = await store.getItem(credAlias);
    const verCred = JSON.parse(verCredJson)
    const credHash = verCred.proof.hash
    if (!getCredByHash(credHash)) {
        logger("roots - accepting credential",credAlias,verCredJson)
        const newWalJson = await PrismModule.importCred(store.getWallet(currentWal._id), credAlias, verCredJson);
        if(newWalJson) {
            const savedWal = await updateWallet(currentWal._id,currentWal.passphrase,newWalJson)
            if(savedWal) {
                const newCred = await getCredentialByMsgId(reply.messageId)
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
    return msgId.replace(models.MODEL_TYPE_MESSAGE,models.MODEL_TYPE_CREDENTIAL)
}

export async function getCredentialByMsgId(msgId) {
    return await store.getItem(getCredentialAlias(msgId))
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

export function getIssuedCredentials(chatAlias: string) {
    logger("roots - Getting issued credentials",chatAlias)
    const longDid = getDid(chatAlias).uriLongForm
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
        logger("roots - No issued credentials for",chatAlias)
    }
    return;
}

async function issueCredential(chat: Object,credAlias: string,cred: Object) {
    const credJson = JSON.stringify(cred)
    logger("roots - issuing credential", credJson)
    const newWalJson = await PrismModule.issueCred(store.getWallet(currentWal._id), chat.id, credJson);
    if(newWalJson) {
        const savedWal = await updateWallet(currentWal._id,currentWal.passphrase,newWalJson)
        if(savedWal) {
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
}

function verifyCredential(credAlias: string) {
    logger("Verifying credential",credAlias)
    const errorArray = JSON.parse(PrismModule.verifyCred(credAlias))
    logger("Credential verification result",credAlias,errorArray)
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

export async function issueDemoCredential(chat: Object,reply: Object) {
    logger("roots - Trying to create demo credential for chat",chat.id,reply)
    const credMsgs = []
    const credAlias = getCredentialAlias(reply.messageId)
    if(chat["published"] && !getIssuedCredential(credAlias)) {
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
        logger("roots - issuing demo credential",cred)
        isProcessing(true)
        const issuedCred = await issueCredential(chat, credAlias, cred)
        isProcessing(false)
        return issuedCred;
    } else {
        logger("roots - Couldn't issue demo credential, is the chat published",chat["published"],"was the credential already found",getIssuedCredential(credAlias))
        return false
    }
//        sendMessage(chat,"Valid credential",
//                      STATUS_MSG_TYPE,
//                      rel.getRelDisplay(ROOTS_BOT))
//
//
//        sendMessage(chat,"Credential imported"
//                    STATUS_MSG_TYPE,
//                    rel.getRelDisplay(ROOTS_BOT))
//        sendMessage(chat,"Valid credential.",
//                      STATUS_MSG_TYPE,
//                      rel.getRelDisplay(ROOTS_BOT))
    //    sendMessage(chat,"https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=0ce00bc602ef54dfc52b4106bebcafb72c2447bdf666cd609d50fd3a7e9d2474",
    //                 BLOCKCHAIN_URI_MSG_TYPE,
    //                 rel.getRelDisplay(PRISM_BOT))
//        sendMessage(chat,"Credential revoked",
//                      STATUS_MSG_TYPE,
//                      rel.getRelDisplay(ROOTS_BOT))
//        sendMessage(chat,"Invalid credential.",
//                    STATUS_MSG_TYPE,
//                    rel.getRelDisplay(ROOTS_BOT))
}

async function initDemo() {
    const rels = await initDemoRelDisplays()
    const intro = await initDemoIntro()
//    const achievements = await initDemoAchievements()
//    const library = await initDemoLibrary()
//    const resume = await initDemoResume()
    const result = (rels && intro)
    return result;
}

async function initDemoAchievements() {
    const achieveCh = await createChat("Achievement Chat","Under Construction - ")

    await sendMessage(achieveCh,ACHIEVEMENT_MSG_PREFIX+"Opened RootsWallet!",
      STATUS_MSG_TYPE,
      rel.getRelItem(ROOTS_BOT))
    await sendMessage(achieveCh,"{subject: you,issuer: RootsWallet,credential: Opened RootsWallet}",
      CREDENTIAL_JSON_MSG_TYPE,
      rel.getRelItem(ROOTS_BOT))
    await sendMessage(achieveCh,ACHIEVEMENT_MSG_PREFIX+"Clicked Example!",
      STATUS_MSG_TYPE,
      rel.getRelItem(ROOTS_BOT))
    await sendMessage(achieveCh,"{subject: you,issuer: RootsWallet,credential: Clicked Example}",
      CREDENTIAL_JSON_MSG_TYPE,
      rel.getRelItem(ROOTS_BOT))
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

async function initDemoRelDisplays() {
    await rel.createRelItem(ROOTS_BOT,
                  "RootsWallet",
                  rootsLogo)
    await rel.createRelItem(PRISM_BOT,
                  "Atala Prism",
                  prismLogo)
    await rel.createRelItem(
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