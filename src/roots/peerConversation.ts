import { getChatItem, sendMessage, MessageType } from "."
import { createDIDPeer,resolveDIDPeer} from '../didpeer'
import * as store from '../store'
import * as models from '../models'
import * as contact from '../relationships'


import { decodeOOBURL, generateOOBURL, sendBasicMessage, mediateRequest, keylistUpdate, retrieveMessages, shortenURLRequest, discoverFeatures } from '../protocols';
import { logger } from "../logging"




export async function startConversation(chatId: string) {
    //CHECK IF DID PEER 
    var chat = getChatItem(chatId)
    const toDid = chat.toDids[0]

    if (toDid.startsWith("did:peer")) {
        // Create a dedicated DID Peer and update chat
        const  fromDid = await createDIDPeer(null,null)
        const DidDoc = await resolveDIDPeer(toDid)
        const serviceEndpoint = DidDoc.service[0].serviceEndpoint
        logger('DidDoc for sender ', DidDoc)
        if (serviceEndpoint.startsWith("https")) {
            chat.fromDids = [fromDid]
            console.log(chat)

            // Discover Peer features
            const features = await discoverFeatures(fromDid, toDid)
            console.log(features)
            chat.feautures = features
            await store.updateItem(models.getStorageKey(chatId, models.ModelType.CHAT), JSON.stringify(chat))
            await sendMessage(chat,
                chat.title + " supports the following protocols:",
                MessageType.TEXT, contact.ROOTS_BOT)
            var isMediator = false
            for (const feat of features) { 
                if (feat.id.includes("coordinate-mediation/2.0")) {isMediator = true}
                await sendMessage(chat,
                    feat.id.replace("https://didcomm.org/",""),
                    MessageType.TEXT, contact.ROOTS_BOT) 
            }
            // Ask to request mediate
            if (isMediator) {

                await sendMessage(chat,
                    "Request Mediate?",
                    MessageType.MEDIATOR_REQUEST_MEDIATE, contact.ROOTS_BOT)

            }

        }
        else{
            await sendMessage(chat,
                "This peer is not reachable via https",
                MessageType.TEXT, contact.ROOTS_BOT)
        }


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
            "Mediate granted and routing keys received. Now you can:",
            MessageType.TEXT, contact.ROOTS_BOT)
        await sendMessage(chat,
            "Create an OOB invitation or check for incoming messages",
                MessageType.MEDIATOR_KEYLYST_UPDATE, contact.ROOTS_BOT)
        await sendMessage(chat,
            "Check for incoming messages",
                MessageType.MEDIATOR_STATUS_REQUEST, contact.ROOTS_BOT)
    }

}

export async function sendBasicMsg(chatId: string, msg: string) {

    const chat = getChatItem(chatId)
    const toDid = chat.toDids[0]
    const fromDid = chat.fromDids[0]
    
    const resp = await sendBasicMessage(msg, fromDid, toDid)
    console.log("RM RESP: "+resp)
    await sendMessage(chat,
        resp,
        MessageType.TEXT, contact.ROOTS_BOT)

}

export async function createOOBInvitation(chatId: string) {

    const chat = getChatItem(chatId)
    const toDid = chat.toDids[0]
    const fromDid = chat.fromDids[0]
    const routingKey = chat.mediator.routingKey
    const  newDid = await createDIDPeer(routingKey,null)
    const updates = [
        {
            recipient_did: newDid,
            action: "add"
        }
    ]
    const resp = await keylistUpdate(updates, fromDid, toDid)
    const ooburl = await generateOOBURL(newDid)
    const shortQR = await shortenURLRequest(fromDid, toDid, ooburl!, 60*60)
    // TODO: save newDID or create a chat placeholder??

    await sendMessage(chat,
        "Display QR Code",
        MessageType.SHOW_QR_CODE, contact.ROOTS_BOT,undefined,{url:shortQR})

}

export async function checkMessages(chatId: string) {

    const chat = getChatItem(chatId)
    const toDid = chat.toDids[0]
    const fromDid = chat.fromDids[0]

    console.log('CHAT ID FOR CHECK MESSAGES: '+chatId)
    const [resp,messages] = await retrieveMessages(fromDid, toDid)
    console.log("RM RESP: "+resp)
    console.log('messages'+messages)
    //Check if resp is > 0 and if so, send messages
    if (messages.length > 0) {
        for (const msg of messages) {
            console.log("MSG: "+msg)
            await sendMessage(chat,
                "LOG:"+ '\n'+
                "type: "+msg.type.replace("https://didcomm.org/","") + '\n' + 
                "body: "+msg.body.content + '\n' + 
                "from: "+msg.body.displayName
                
                , MessageType.TEXT , contact.ROOTS_BOT)
                
        }
    } else {
    
    await sendMessage(chat,
        "Messages: " + resp,
        MessageType.TEXT, contact.ROOTS_BOT)
    }
}