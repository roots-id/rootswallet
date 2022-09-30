import {logger} from "../logging";
import { sendMessage, pack, receiveMessage, unpack } from "../didcommv2";
export async function retrieveMessages(from: string, to: string) {
    try {
        const messageCount = await statusRequest(from, to)
        logger("Pickup message count: "+messageCount)
        //create empty array Typescript
        let messages: { type: string; body: string; }[] = []

        if (messageCount>0){
            const attachments = await deliveryRequest(1,from, to)
            logger("Pickup attachments: "+attachments[0].data.json)
            messages = await processDelivery(attachments, from, to)
        }
        return [messageCount,messages]
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

export async function statusRequest(from: string, to: string) {
    try {
        const msgPacked = await pack(
            {}, 
            from, 
            to, 
            "https://didcomm.org/messagepickup/3.0/status-request", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendMessage(msgPacked, to)
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

export async function deliveryRequest(limit: number, from: string, to: string) {
    try {
        const msgPacked = await pack(
            {limit: parseInt(limit.toString())}, 
            from, 
            to, 
            "https://didcomm.org/messagepickup/3.0/delivery-request", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendMessage(msgPacked, to)
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

export async function messageReceived(ids: string[], from: string, to: string) {
    try {
        const msgPacked = await pack(
            {message_id_list: ids}, 
            from, 
            to, 
            "https://didcomm.org/messagepickup/3.0/messages-received", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendMessage(msgPacked, to)
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

 async function processDelivery(attachments: any[], from: string, to: string) {
    try {
        let messages: { type: any; body: any; }[] = []
        for (const attachment of attachments) {
            const msgPacked = attachment.data.json
            const msgId = attachment.id
            await messageReceived([msgId], from, to)
            //log msgPacked to console
            logger("Pickup msgId: "+msgId)
            receiveMessage(JSON.stringify(msgPacked))
            const msg = await unpackReceivedMessage(JSON.stringify(msgPacked))
            logger("Pickupedd msg type: "+msg.type)
            messages.push(msg)
        }
        return messages
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

export async function unpackReceivedMessage(packMsg: any) {
    const unpacked = await unpack(packMsg)
    const msg = JSON.parse(unpacked.message)
    return {type: msg.type, body: msg.body}
}
export async function receivePickup(msg: any) {
    try {
        const type = JSON.parse(msg.message).type
        switch (type) {
            case "https://didcomm.org/messagepickup/3.0/status":
                return JSON.parse(msg.message).body.message_count
            case "https://didcomm.org/messagepickup/3.0/delivery":
                return JSON.parse(msg.message).attachments
            default:
                break;
        }

    } catch (error: any) {
        logger("pickup - Error", error)
    }
}