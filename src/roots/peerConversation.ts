import { getChatItem, getChatItems, sendMessage, MessageType, importContact, createChat, initRoot } from "."
import { createDIDPeer} from '../didpeer'
import * as store from '../store'
import * as models from '../models'
import * as contact from '../relationships'
import uuid from 'react-native-uuid';
import { decodeOOBURL, generateOOBURL, sendBasicMessage, mediateRequest, keylistUpdate, retrieveMessages, shortenURLRequest, discoverFeatures } from '../protocols';

export async function startConversation(chatId: string) {
    try {
    var chat = getChatItem(chatId)
    const toDid = chat.toDids[0]
    // Create a dedicated DID Peer and update chat
    if (toDid.startsWith("did:peer")) {
       // Find if theres a mediator
        if (chat.fromDids.length === 0){
            const chats = getChatItems()
            var routingKey = null 
            var mediatorDid = null
            var didToMediator = null
            chats.forEach(element => {
                if ( element.mediator !== undefined) { 
                    routingKey = element.mediator.routingKey
                    mediatorDid = element.toDids[0]
                    didToMediator = element.fromDids[0]
                }
            });
            var  fromDid = await createDIDPeer(routingKey,null)
            if (routingKey !== null){
                console.log("UPDATING KEYS")
                console.log(fromDid)
                const updates = [
                    {
                        recipient_did: fromDid,
                        action: "add"
                    }
                 ]
            const resp = await keylistUpdate(updates, didToMediator, mediatorDid)
            } 

            chat.fromDids = [fromDid]
            await store.updateItem(models.getStorageKey(chatId, models.ModelType.CHAT), JSON.stringify(chat))
        } 

        // Discover Peer features
        const features = await discoverFeatures(chat.fromDids[0], toDid)
        console.log(features)
        chat.feautures = features
        await store.updateItem(models.getStorageKey(chatId, models.ModelType.CHAT), JSON.stringify(chat))
        var isMediator = false
        if (features !== undefined){
            //create an array of features using the id of the feature
            //create array of strings typescript
            let featuresArray = Array<string>()

            
            for (const feat of features) { 
                if (feat.id.includes("coordinate-mediation/2.0")) {isMediator = true}
                featuresArray.push(feat.id.replace('https://didcomm.org/', ''))
            }

            await sendMessage(chat,
                chat.title + " supports the following protocols:\n" + featuresArray.join(",\n"),
                MessageType.TEXT, contact.ROOTS_BOT)
        }
        
        // Ask to request mediate
        if (isMediator) {

            await sendMessage(chat,
                "Request Mediate?",
                MessageType.MEDIATOR_REQUEST_MEDIATE, contact.ROOTS_BOT)
        }
    }
    } catch (error) {
        console.log("Start Conversation error " + error)
    }
    
}

export async function requestMediate(chatId: string) {
    const chat = getChatItem(chatId)
    console.log(chat)
    const toDid = chat.toDids[0]
    const fromDid = chat.fromDids[0]
    const resp = await mediateRequest(fromDid, toDid)
    console.log(resp)
    if (resp.includes("MEDIATE DENY")){
        await sendMessage(chat,
            "Mediate denied",
            MessageType.TEXT, contact.ROOTS_BOT)
    } else {
        chat.mediator = {
            routingKey: resp
        }
        await store.updateItem(models.getStorageKey(chatId, models.ModelType.CHAT), JSON.stringify(chat))
        await sendMessage(chat,
            "Mediation granted and routing keys received. Now you can receive messages offilne. To create a new communication channgel using the icon in the top right.",
            MessageType.TEXT, contact.ROOTS_BOT)
    }

}

export async function sendBasicMsg(chatId: string, msg: string) {
    const chat = getChatItem(chatId)
    const toDid = chat.toDids[0]
    const fromDid = chat.fromDids[0]
    const resp = await sendBasicMessage(msg, fromDid, toDid)
}

export async function createOOBInvitation(chatId: string) {
    const chat = getChatItem(chatId)
    const toDid = chat.toDids[0]
    const fromDid = chat.fromDids[0]
    const routingKey = chat.mediator.routingKey
    const  newDid = await createDIDPeer(routingKey,null)
    console.log(newDid)
    const updates = [
        {
            recipient_did: newDid,
            action: "add"
        }
    ]
    const resp = await keylistUpdate(updates, fromDid, toDid)
    const ooburl = await generateOOBURL(newDid)
    const shortQR = await shortenURLRequest(fromDid, toDid, ooburl!, 60*60)
    await sendMessage(chat,
        "Display OOB invitation for id: "+ newDid.substring(0,40),
        MessageType.SHOW_QR_CODE, contact.ROOTS_BOT,undefined,{url:shortQR})
    return shortQR
}

export async function checkMessages(chatId: string) {
    const chat = getChatItem(chatId)
    const toDid = chat.toDids[0]
    const fromDid = chat.fromDids[0]
    const resp = await retrieveMessages(fromDid, toDid)
}

export async function retrieveMessagesFromMediator(chatId: string) {
    const chat = getChatItem(chatId)
    const toDid = chat.toDids[0]
    const fromDid = chat.fromDids[0]
    const resp = await retrieveMessages(fromDid, toDid)
    await sendMessage(chat,
        "Messages: " + resp,
        MessageType.TEXT, contact.ROOTS_BOT)
}

export async function publishTextMessage(content: string, fromDid: string, toDid: string) {
    const chats = getChatItems()
    var chat = null
    chats.forEach(element => {

        //TODO now checks only sender DID. Should check reeiver DID as well?
        if ( element.toDids.includes(toDid)){  //element.fromDids.includes(from) &&
            chat = element
        }
    });
    if (chat === null){
        const personLogo = require('../assets/smallBWPerson.png');
        const displayName = "Agent-"+uuid.v4().toString().slice(-5)
        const id = uuid.v4().toString()
        await initRoot(
            id,
            contact.getUserId(),
            toDid,
            displayName,
            personLogo,
            fromDid)
        chat = await getChatItem(id)
    }
    
    await sendMessage(chat,
        content,
        MessageType.TEXT, contact.ROOTS_BOT)
}

