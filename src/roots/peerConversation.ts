import { getChatItem, sendMessage, MessageType } from "."
import { createDIDPeer} from '../didpeer'
import * as store from '../store'
import * as models from '../models'
import * as contact from '../relationships'


import { decodeOOBURL, generateOOBURL, sendBasicMessage, mediateRequest, keylistUpdate, retrieveMessages, shortenURLRequest, discoverFeatures } from '../protocols';




export async function startConversation(chatId: string) {
    //CHECK IF DID PEER 
    var chat = getChatItem(chatId)
    const toDid = chat.toDids[0]

    if (toDid.startsWith("did:peer")) {
        // Create a dedicated DID Peer and update chat
        const  fromDid = await createDIDPeer(null,null)
        chat.fromDids = [fromDid]
        console.log(chat)
        await store.updateItem(models.getStorageKey(chatId, models.ModelType.CHAT), JSON.stringify(chat))

        // Discover Peer features
        const features = await discoverFeatures(fromDid, toDid)
        console.log(features)
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
        await sendMessage(chat,
            "Mediate granted and routing keys received",
            MessageType.TEXT, contact.ROOTS_BOT)
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